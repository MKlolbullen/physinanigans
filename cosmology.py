"""FLRW background: matter, radiation, Lambda, curvature, test-photon transport.

Dependency-free reference engine. Run to emit the default history as CSV.
"""
import csv
import math
import sys

PRESETS=dict(mixed=dict(m=.3,r=.0001,l=.6999),matter=dict(m=1,r=0,l=0),
             radiation=dict(m=0,r=1,l=0),closed=dict(m=2,r=0,l=0),
             vacuum=dict(m=0,r=0,l=1),empty=dict(m=0,r=0,l=0))


def friedmann(a,p): return p['r']/a**2+p['m']/a+p['k']+p['l']*a**2


def parameters(**kwargs):
    p=dict(m=.3,r=.0001,l=.6999,aStart=.2,aMin=.05,aMax=3.,tMax=8.,tolerance=1e-11,maxStep=.025)
    if set(kwargs)-set(p): raise ValueError('Unknown cosmology parameter')
    p.update(kwargs)
    if not all(math.isfinite(v) for v in p.values()): raise ValueError('Parameters must be finite')
    if min(p['m'],p['r'],p['l'])<0 or not 0<p['aMin']<p['aStart']<p['aMax'] or min(p['tMax'],p['tolerance'],p['maxStep'])<=0:
        raise ValueError('Invalid cosmology parameters')
    p['k']=1-p['m']-p['r']-p['l']
    if friedmann(p['aStart'],p)<=0: raise ValueError('No expanding solution at starting scale')
    return p


def derivative(y,p):
    a,v,_=y
    return [v,-p['r']/a**3-p['m']/(2*a**2)+p['l']*a,1/a]


def rk4(y,h,p):
    k1=derivative(y,p)
    k2=derivative([v+h*k/2 for v,k in zip(y,k1)],p)
    k3=derivative([v+h*k/2 for v,k in zip(y,k2)],p)
    k4=derivative([v+h*k for v,k in zip(y,k3)],p)
    return [v+h*(a+2*b+2*c+d)/6 for v,a,b,c,d in zip(y,k1,k2,k3,k4)]


def advance(y,h,p):
    full,half=rk4(y,h,p),rk4(rk4(y,h/2,p),h/2,p)
    return [v+(v-f)/15 for v,f in zip(half,full)]


def boundary(y,h,p,index,target):
    lo,hi,start=0,h,y[index]-target
    for _ in range(45):
        mid=(lo+hi)/2
        if (advance(y,mid,p)[index]-target)*start>0: lo=mid
        else: hi=mid
    dt=(lo+hi)/2
    return dt,advance(y,dt,p)


def simulate(**kwargs):
    p=parameters(**kwargs)
    t,y,h=0.,[p['aStart'],math.sqrt(friedmann(p['aStart'],p)),0.],.001
    rows,turns=[dict(t=t,y=y[:])],[]
    reason,max_residual='time limit',0.
    for _ in range(200000):
        if t>=p['tMax']: break
        h=min(h,p['maxStep'],p['tMax']-t,.08*y[0]/max(abs(y[1]),.1))
        if h<1e-12: raise ArithmeticError('Step became too small')
        full,half=rk4(y,h,p),rk4(rk4(y,h/2,p),h/2,p)
        err=max(abs(v-f)/(15*p['tolerance']*(1+max(abs(v),abs(old)))) for v,f,old in zip(half,full,y))
        if not all(math.isfinite(v) for v in half) or half[0]<=0: raise ArithmeticError('Invalid integration state')
        if err>1:
            h*=max(.15,.85*err**(-.2))
            continue
        if y[1]>0>half[1]:
            dt,turn=boundary(y,h,p,1,0)
            turns.append(dict(t=t+dt,a=turn[0]))
        next_y,dt,stop=[v+(v-f)/15 for v,f in zip(half,full)],h,False
        if half[0]>=p['aMax'] or half[0]<=p['aMin']:
            target=p['aMax'] if half[0]>=p['aMax'] else p['aMin']
            dt,next_y=boundary(y,h,p,0,target)
            stop=True
            reason='upper scale limit' if target==p['aMax'] else 'lower scale limit'
        t+=dt
        y=next_y
        rows.append(dict(t=t,y=y[:]))
        norm=p['r']/y[0]**2+p['m']/y[0]+abs(p['k'])+p['l']*y[0]**2
        max_residual=max(max_residual,abs(y[1]**2-friedmann(y[0],p))/max(norm,1e-30))
        if stop or p['tMax']-t<1e-12: break
        h*=2 if err==0 else min(2,max(.5,.9*err**(-.2)))
    else: raise ArithmeticError('Integration budget exceeded')
    return dict(p=p,rows=rows,turns=turns,reason=reason,maxResidual=max_residual,end=t)


def sample(run,t):
    if not math.isfinite(t) or not 0<=t<=run['end']+1e-10: raise ValueError('Time outside computed history')
    t=min(t,run['end'])
    rows,p=run['rows'],run['p']
    lo,hi=0,len(rows)-1
    while lo+1<hi:
        mid=(lo+hi)//2
        if rows[mid]['t']<=t: lo=mid
        else: hi=mid
    y=advance(rows[lo]['y'],t-rows[lo]['t'],p)
    a,v,chi=y
    matter,radiation,vacuum=p['m']/a**3,p['r']/a**4,p['l']
    total=matter+radiation+vacuum
    return dict(t=t,a=a,v=v,chi=chi,H=v/a,acceleration=derivative(y,p)[1],wavelength=a/p['aStart'],
                photonEnergy=p['aStart']/a,temperature=p['aStart']/a if p['r']>0 else None,
                density=dict(matter=matter,radiation=radiation,vacuum=vacuum),
                fractions=[matter/total,radiation/total,vacuum/total] if total>0 else [0,0,0],
                comovingVolumeMass=matter*a**3,curvature=p['k'])


if __name__=='__main__':
    run=simulate()
    writer=csv.DictWriter(sys.stdout,fieldnames=['t','a','H','wavelength','photonEnergy','chi'])
    writer.writeheader()
    for i in range(501):
        s=sample(run,run['end']*i/500)
        writer.writerow({k:s[k] for k in writer.fieldnames})
