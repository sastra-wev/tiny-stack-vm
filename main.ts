import{mkdirSync,readdirSync,readFileSync,writeFileSync}from"node:fs";
import{join}from"node:path";
const M=new Int8Array(256).fill(-1),Q=new Uint8Array(256),W=new Uint8Array(256),G=new Uint8Array(256);
const d=(o:number,a:number,b:number,c:number)=>{M[o]=a;Q[o]=b;W[o]=c;G[o]=1};
d(0,0,0,0);d(1,1,0,1);d(2,4,0,1);d(3,0,1,0);d(4,0,1,2);d(5,0,2,2);d(6,0,2,3);d(7,0,3,3);
d(16,0,2,1);d(17,0,2,1);d(18,0,2,1);d(19,0,2,1);d(20,0,2,1);d(21,0,2,1);d(22,0,2,1);d(23,0,1,1);d(24,0,2,1);d(25,0,2,1);d(26,0,2,1);d(27,0,1,1);d(28,0,2,1);d(29,0,2,1);d(30,0,2,1);d(32,0,2,1);d(33,0,2,1);d(34,0,2,1);d(48,2,0,0);d(49,2,1,0);d(50,2,1,0);d(51,2,0,0);d(52,0,0,0);d(64,0,1,1);d(65,0,2,0);d(80,0,1,0);d(81,0,1,0);d(82,0,0,1);d(83,0,1,0);
function run(p:Uint8Array,q:Uint8Array):{o:Uint8Array,c:number}{
const n=p.length,D=new Int32Array(256),C=new Int32Array(64),Y=new Int32Array(256),O=new Uint8Array(65536);
let s=0,z=0,l=0,i=0,j=0,t=0;
const e=(c:number)=>({o:O.subarray(0,l),c});
for(;;){
if(t===1e6)return e(10);
if(j<0||j>=n)return e(9);
const a=p[j];
if(!G[a])return e(5);
const f=M[a];
if(j+f>=n)return e(9);
t++;
const x=j+1+f,k=Q[a];
if(s<k)return e(2);
if(s-k+W[a]>256)return e(3);
j=x;
switch(a){
case 0:return e(0);
case 1:D[s++]=(p[x-1]<<24)>>24;break;
case 2:D[s++]=p[x-4]|p[x-3]<<8|p[x-2]<<16|p[x-1]<<24;break;
case 3:s--;break;
case 4:D[s]=D[s-1];s++;break;
case 5:{const v=D[s-1];D[s-1]=D[s-2];D[s-2]=v;break}
case 6:D[s]=D[s-2];s++;break;
case 7:{const v=D[s-3];D[s-3]=D[s-2];D[s-2]=D[s-1];D[s-1]=v;break}
case 23:D[s-1]=-D[s-1]|0;break;
case 27:D[s-1]=~D[s-1];break;
case 16:case 17:case 18:case 19:case 20:case 21:case 22:case 24:case 25:case 26:case 28:case 29:case 30:case 32:case 33:case 34:{
const b=D[s-1],h=D[s-2];let r=0;
if(a===16)r=h+b|0;else if(a===17)r=h-b|0;else if(a===18)r=Math.imul(h,b);
else if(a===19){if(!b)return e(4);r=h===-2147483648&&b===-1?h:(h/b)|0}
else if(a===20){if(!b)return e(4);r=b===-1?0:(h%b)|0}
else if(a===21){if(!b)return e(4);r=Math.floor((h>>>0)/(b>>>0))|0}
else if(a===22){if(!b)return e(4);r=(h>>>0)%(b>>>0)|0}
else if(a===24)r=h&b;else if(a===25)r=h|b;else if(a===26)r=h^b;
else if(a===28)r=h<<(b&31);else if(a===29)r=h>>(b&31);else if(a===30)r=(h>>>(b&31))|0;
else if(a===32)r=h===b?1:0;else if(a===33)r=h<b?1:0;else r=(h>>>0)<(b>>>0)?1:0;
s-=2;D[s++]=r;break}
case 48:case 49:case 50:{
const g=((p[x-2]|p[x-1]<<8)<<16)>>16;let y=a===48;
if(a!==48){const v=D[--s];y=a===49?v===0:v!==0}
if(y)j=x+g;break}
case 51:if(z===64)return e(7);C[z++]=x;j=p[x-2]|p[x-1]<<8;break;
case 52:if(!z)return e(8);j=C[--z];break;
case 64:{const v=D[s-1];if(v<0||v>255)return e(6);D[s-1]=Y[v];break}
case 65:{const v=D[s-1],h=D[s-2];if(v<0||v>255)return e(6);s-=2;Y[v]=h;break}
case 80:{const v=String(D[s-1]);if(l+v.length>65536)return e(11);s--;for(let w=0;w<v.length;w++)O[l++]=v.charCodeAt(w);break}
case 81:if(l+1>65536)return e(11);O[l++]=D[--s]&255;break;
case 82:D[s++]=i<q.length?q[i++]:-1;break;
case 83:return e(D[--s]&255);
default:return e(5);
}
}
}
const A=process.env.MAKEFUN_INPUT_DIR??"/input",B=process.env.MAKEFUN_OUTPUT_DIR??"/output";
for(const id of readdirSync(A).sort()){
const r=run(new Uint8Array(readFileSync(join(A,id,"program.bin"))),new Uint8Array(readFileSync(join(A,id,"input.bin"))));
mkdirSync(join(B,id),{recursive:true});
writeFileSync(join(B,id,"stdout.bin"),r.o);
writeFileSync(join(B,id,"exit.txt"),r.c+"\n");
}
