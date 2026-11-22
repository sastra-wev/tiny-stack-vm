// Tiny stack VM: answers a whole make.fun set of 40 programs. Reads
// program.bin + input.bin per instance from MAKEFUN_INPUT_DIR (default
// /input), writes stdout.bin + exit.txt to MAKEFUN_OUTPUT_DIR (/output).
// Node 22, standard library only. ISA: 32-bit wrapping ints, 256-value
// data stack, 64-deep call stack, 256 words of memory, ten traps.
import{mkdirSync,readFileSync,writeFileSync}from"node:fs";
import{join}from"node:path";
const D=process.env.MAKEFUN_INPUT_DIR??"/input",E=process.env.MAKEFUN_OUTPUT_DIR??"/output";
const rb=f=>{try{return new Uint8Array(readFileSync(f))}catch{return new Uint8Array(0)}};
function run(g,q){
 const s=[],k=[],m=new Int32Array(256),o=[];
 let p=0,j=0,t=0;
 const fin=c=>({o:Uint8Array.from(o),c});
 const need=n=>s.length<n;
 const push=v=>s.length<256?(s.push(v|0),1):0;
 for(;;){
  if(t>=1e6)return fin(10);
  if(p<0||p>=g.length)return fin(9);
  const op=g[p],fit=n=>p+n<g.length;
  const i16=()=>{const r=g[p+1]|g[p+2]<<8;return r<<16>>16};
  const u16=()=>g[p+1]|g[p+2]<<8;
  let a,b,r;
  switch(op){
   case 0:return fin(0);
   case 1:
    if(!fit(1))return fin(9);
    b=g[p+1];if(!push(b<128?b:b-256))return fin(3);p+=2;break;
   case 2:
    if(!fit(4))return fin(9);
    if(!push(g[p+1]|g[p+2]<<8|g[p+3]<<16|g[p+4]<<24))return fin(3);p+=5;break;
   case 3:if(need(1))return fin(2);s.pop();p++;break;
   case 4:if(need(1))return fin(2);if(!push(s[s.length-1]))return fin(3);p++;break;
   case 5:if(need(2))return fin(2);a=s.pop();b=s.pop();s.push(a,b);p++;break;
   case 6:if(need(2))return fin(2);if(!push(s[s.length-2]))return fin(3);p++;break;
   case 7:if(need(3))return fin(2);a=s.pop();b=s.pop();r=s.pop();s.push(b,a,r);p++;break;
   case 0x17:if(need(1))return fin(2);s.push(-s.pop()|0);p++;break;
   case 0x1b:if(need(1))return fin(2);s.push(~s.pop());p++;break;
   case 0x30:if(!fit(2))return fin(9);p=p+3+i16();break;
   case 0x31:case 0x32:
    if(!fit(2))return fin(9);
    if(need(1))return fin(2);
    a=s.pop();p=(op==0x31?a==0:a!=0)?p+3+i16():p+3;break;
   case 0x33:
    if(!fit(2))return fin(9);
    if(k.length>=64)return fin(7);
    k.push(p+3);p=u16();break;
   case 0x34:if(!k.length)return fin(8);p=k.pop();break;
   case 0x40:
    if(need(1))return fin(2);
    a=s.pop();if(a<0||a>255)return fin(6);s.push(m[a]);p++;break;
   case 0x41:
    if(need(2))return fin(2);
    a=s.pop();if(a<0||a>255)return fin(6);m[a]=s.pop();p++;break;
   case 0x50:
    if(need(1))return fin(2);
    a=s.pop();
    r=a<0?1:0;
    b=a<0?-a:a;
    let d=0,c=[0,0,0,0,0,0,0,0,0,0,0];
    do{c[d++]=48+b%10;b=(b/10)|0}while(b);
    if(o.length+r+d>65536)return fin(11);
    if(r)o.push(45);
    for(let i=d-1;i>=0;i--)o.push(c[i]);
    p++;break;
   case 0x51:
    if(need(1))return fin(2);
    if(o.length>=65536)return fin(11);
    o.push(s.pop()&255);p++;break;
   case 0x52:
    a=j<q.length?q[j++]:-1;
    if(!push(a))return fin(3);p++;break;
   case 0x53:if(need(1))return fin(2);return fin(s.pop()&255);
   default:
    if(op<0x10||op>0x22)return fin(5);
    if(need(2))return fin(2);
    b=s.pop();a=s.pop();
    if(op>=0x13&&op<=0x16&&b==0)return fin(4);
    r=op==0x10?(a+b)|0:op==0x11?(a-b)|0:op==0x12?Math.imul(a,b):op==0x13?(a/b)|0:op==0x14?(a%b)|0:op==0x15?(a>>>0)/(b>>>0)|0:op==0x16?(a>>>0)%(b>>>0)|0:op==0x18?a&b:op==0x19?a|b:op==0x1a?a^b:op==0x1c?a<<(b&31):op==0x1d?a>>(b&31):op==0x1e?(a>>>(b&31))|0:op==0x20?a==b?1:0:op==0x21?a<b?1:0:(a>>>0)<(b>>>0)?1:0;
    s.push(r|0);p++;break;
  }
  t++;
 }
}
for(let k=1;k<=40;k++){
 const id="i"+String(k).padStart(3,"0");
 const w=run(rb(join(D,id,"program.bin")),rb(join(D,id,"input.bin")));
 mkdirSync(join(E,id),{recursive:true});
 writeFileSync(join(E,id,"stdout.bin"),w.o);
 writeFileSync(join(E,id,"exit.txt"),w.c+"\n");
}
