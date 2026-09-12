const T=4000, MAXP=500, MAXL=14, WIN=30, OFF=T+24, NB=2*T+128, NW=(NB+31)>>5;
const cur=new Uint32Array(NW),nxt=new Uint32Array(NW),A=new Uint32Array(NW),B=new Uint32Array(NW);
function step(){let c=0;for(let w=0;w<NW;w++){const v=cur[w];A[w]=((v<<1)|c)>>>0;c=v>>>31;}
  let b=0;for(let w=NW-1;w>=0;w--){const v=cur[w];B[w]=((v>>>1)|(b<<31))>>>0;b=v&1;}
  for(let w=0;w<NW;w++)nxt[w]=(A[w]^(cur[w]|B[w]))>>>0;cur.set(nxt);}
const getbit=j=>(cur[j>>5]>>>(j&31))&1;
function evPer(col){const n=col.length,half=n>>1;
  for(let p=1;p<=MAXP;p++){if(half<4*p)break;let ok=true;
    for(let i=n-1;i>=half;i--)if(col[i]!==col[i-p]){ok=false;break;}
    if(ok)return p;}return 0;}

const seeds=[];
for(let L=1;L<=MAXL;L++){const inner=L<=2?1:(1<<(L-2));
  for(let m=0;m<inner;m++){const s=L===1?"1":"1"+(L>2?m.toString(2).padStart(L-2,"0"):"")+"1";
    if(s.length===L)seeds.push(s);}}

const NC=2*WIN+1, cols=[]; for(let k=0;k<NC;k++)cols.push(new Uint8Array(T));
let hits=[], dens=[], worst={d:0.5,seed:"",col:0}, best={d:0.5,seed:"",col:0};
const half=T>>1;
for(const s of seeds){
  cur.fill(0);
  for(let i=0;i<s.length;i++) if(s[i]==="1") cur[(OFF+i)>>5]|=(1<<((OFF+i)&31));
  for(let t=0;t<T;t++){for(let k=-WIN;k<=WIN;k++)cols[k+WIN][t]=getbit(OFF+k);step();}
  for(let k=-WIN;k<=WIN;k++){
    const col=cols[k+WIN];
    const p=evPer(col); if(p)hits.push({seed:s,col:k,p});
    let o=0; for(let t=half;t<T;t++)o+=col[t];
    const d=o/(T-half);
    dens.push(d);
    if(Math.abs(d-0.5)>Math.abs(worst.d-0.5)){worst={d,seed:s,col:k};}
    if(Math.abs(d-0.5)<Math.abs(best.d-0.5)){best={d,seed:s,col:k};}
  }
}
console.log(`seeds ${seeds.length}  columns/seed ${NC}  pairs ${dens.length}  T=${T}  period range <=${MAXP}  onset <=${half}`);
console.log(`\nEVENTUALLY PERIODIC COLUMNS: ${hits.length}`);
if(hits.length)hits.slice(0,20).forEach(h=>console.log(`  seed ${h.seed} col ${h.col} period ${h.p}`));

dens.sort((a,b)=>a-b);
const q=f=>dens[Math.min(dens.length-1,Math.floor(f*dens.length))];
const mean=dens.reduce((a,b)=>a+b,0)/dens.length;
const sd=Math.sqrt(dens.reduce((a,b)=>a+(b-mean)**2,0)/dens.length);
console.log(`\nDENSITY OF 1s over the last ${T-half} steps, across all seed/column pairs:`);
console.log(`  mean ${mean.toFixed(6)}   sd ${sd.toFixed(6)}`);
console.log(`  min ${q(0).toFixed(4)}  p1 ${q(.01).toFixed(4)}  p25 ${q(.25).toFixed(4)}  median ${q(.5).toFixed(4)}  p75 ${q(.75).toFixed(4)}  p99 ${q(.99).toFixed(4)}  max ${q(.9999).toFixed(4)}`);
console.log(`  most skewed: density ${worst.d.toFixed(4)} at seed "${worst.seed}" column ${worst.col}`);
console.log(`  binomial sd for ${T-half} fair coin flips: ${(0.5/Math.sqrt(T-half)).toFixed(6)}  (compare to sd above)`);
let out3=0,out5=0; const bsd=0.5/Math.sqrt(T-half);
for(const d of dens){if(Math.abs(d-0.5)>3*bsd)out3++; if(Math.abs(d-0.5)>5*bsd)out5++;}
console.log(`  pairs beyond 3 binomial sd: ${out3} (${(100*out3/dens.length).toFixed(2)}%)   beyond 5 sd: ${out5} (${(100*out5/dens.length).toFixed(3)}%)`);
console.log(`  expected beyond 3sd if independent fair coins: ~${(0.0027*dens.length).toFixed(0)}  beyond 5sd: ~${(5.7e-7*dens.length).toFixed(2)}`);
