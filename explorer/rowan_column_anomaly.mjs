// Anomaly hunt: is ANY finite seed's column measurably more self-similar than a fair coin?
// Statistic: max over lags p in [1,LMAX] of the agreement rate between the column tail and
// itself shifted by p.  NULL MODEL COMPUTED FIRST, over the identical procedure.
const T=4000, TAIL=2048, LMAX=512, MAXL=14, WIN=30, OFF=T+24, NB=2*T+128, NW=(NB+31)>>5;
const cur=new Uint32Array(NW),nxt=new Uint32Array(NW),A=new Uint32Array(NW),B=new Uint32Array(NW);
function step(){let c=0;for(let w=0;w<NW;w++){const v=cur[w];A[w]=((v<<1)|c)>>>0;c=v>>>31;}
  let b=0;for(let w=NW-1;w>=0;w--){const v=cur[w];B[w]=((v>>>1)|(b<<31))>>>0;b=v&1;}
  for(let w=0;w<NW;w++)nxt[w]=(A[w]^(cur[w]|B[w]))>>>0;cur.set(nxt);}
const getbit=j=>(cur[j>>5]>>>(j&31))&1;
const pc=v=>{v=v-((v>>1)&0x55555555);v=(v&0x33333333)+((v>>2)&0x33333333);
  return (((v+(v>>4))&0x0f0f0f0f)*0x01010101)>>24;};
const TW=TAIL>>5;
// best agreement over lags, on a packed bit tail
function bestLag(w){let best=0,bp=0;
  for(let p=1;p<=LMAX;p++){const n=TAIL-p;let diff=0;
    for(let i=0;i<n;i++){const a=(w[i>>5]>>>(i&31))&1,b=(w[(i+p)>>5]>>>((i+p)&31))&1;if(a!==b)diff++;}
    const agree=1-diff/n; if(agree>best){best=agree;bp=p;}}
  return [best,bp];}

// --- NULL MODEL FIRST, same procedure, same lengths ---
let s0=987654321; const rb=()=>{s0^=s0<<13;s0^=s0>>>17;s0^=s0<<5;s0>>>=0;return s0&1;};
const NN=1500, nullBest=[];
for(let k=0;k<NN;k++){const w=new Uint32Array(TW);
  for(let i=0;i<TAIL;i++) if(rb()) w[i>>5]|=(1<<(i&31));
  nullBest.push(bestLag(w)[0]);}
nullBest.sort((a,b)=>a-b);
const nq=f=>nullBest[Math.min(NN-1,Math.floor(f*NN))];
console.log(`NULL MODEL (${NN} pseudorandom columns, identical procedure, lags 1..${LMAX}, tail ${TAIL}):`);
console.log(`  best-agreement  median ${nq(.5).toFixed(4)}  p99 ${nq(.99).toFixed(4)}  max ${nullBest[NN-1].toFixed(4)}`);
const nullMax=nullBest[NN-1];

// --- RULE 30, sampled seed/column pairs ---
const seeds=[];
for(let L=1;L<=MAXL;L++){const inner=L<=2?1:(1<<(L-2));
  for(let m=0;m<inner;m++){const s=L===1?"1":"1"+(L>2?m.toString(2).padStart(L-2,"0"):"")+"1";
    if(s.length===L)seeds.push(s);}}
let s1=13579; const rnd=()=>{s1^=s1<<13;s1^=s1>>>17;s1^=s1<<5;s1>>>=0;return s1;};
const SAMPLE=1500, picked=[];
for(let k=0;k<SAMPLE;k++) picked.push([seeds[rnd()%seeds.length], (rnd()%(2*WIN+1))-WIN]);

const col=new Uint8Array(T), results=[];
for(const [s,kcol] of picked){
  cur.fill(0);
  for(let i=0;i<s.length;i++) if(s[i]==="1") cur[(OFF+i)>>5]|=(1<<((OFF+i)&31));
  for(let t=0;t<T;t++){ col[t]=getbit(OFF+kcol); step(); }
  const w=new Uint32Array(TW);
  for(let i=0;i<TAIL;i++) if(col[T-TAIL+i]) w[i>>5]|=(1<<(i&31));
  const [b,p]=bestLag(w); results.push({b,p,s,kcol});
}
const bs=results.map(r=>r.b).sort((a,b)=>a-b);
const rq=f=>bs[Math.min(bs.length-1,Math.floor(f*bs.length))];
console.log(`\nRULE 30 (${SAMPLE} sampled seed/column pairs, same procedure):`);
console.log(`  best-agreement  median ${rq(.5).toFixed(4)}  p99 ${rq(.99).toFixed(4)}  max ${bs[bs.length-1].toFixed(4)}`);
const over=results.filter(r=>r.b>nullMax).sort((a,b)=>b.b-a.b);
console.log(`\n  pairs exceeding the NULL MAXIMUM (${nullMax.toFixed(4)}): ${over.length}`);
if(over.length) over.slice(0,10).forEach(r=>console.log(`    agreement ${r.b.toFixed(4)} at lag ${r.p}, seed "${r.s}" column ${r.kcol}`));
else console.log("    none — rule 30's columns are not more self-similar than the control at any lag <= "+LMAX);
console.log(`\n  (a column that were eventually periodic with period <= ${LMAX} would score 1.0000)`);
