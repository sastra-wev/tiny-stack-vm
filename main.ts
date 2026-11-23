import{mkdirSync as M,readFileSync as R,writeFileSync as W}from"node:fs";
const D=process.env.MAKEFUN_INPUT_DIR??"/input",E=process.env.MAKEFUN_OUTPUT_DIR??"/output",rb=f=>{try{return R(f)}catch{return[]}},T="000112230000000022222221222122222220000000000000000000000000000012000000000000001101";
function run(g,q){
const s=[],k=[],m=new Int32Array(256),o=[];
let p=0,j=0,t=0,a,b,r;
const fin=c=>{throw[Uint8Array.from(o),c]},push=v=>s.length<256&&s.push(v|0),fit=n=>p+n<g.length,i16=()=>(g[p+1]|g[p+2]<<8)<<16>>16;
for(;t<1e6;t++,p++){
if(p>>>0>=g.length)fin(9);
const op=g[p];
if(s.length<(T[op]|0))fin(2);
switch(op){
case 0:fin(0);
case 1:if(!fit(1))fin(9);if(!push(g[p+1]<<24>>24))fin(3);p++;break;
case 2:if(!fit(4))fin(9);if(!push(g[p+1]|g[p+2]<<8|g[p+3]<<16|g[p+4]<<24))fin(3);p+=4;break;
case 3:s.pop();break;
case 4:if(!push(s[s.length-1]))fin(3);break;
case 5:s.push(s.pop(),s.pop());break;
case 6:if(!push(s[s.length-2]))fin(3);break;
case 7:a=s.pop();b=s.pop();r=s.pop();s.push(b,a,r);break;
case 23:push(-s.pop());break;
case 27:push(~s.pop());break;
case 48:if(!fit(2))fin(9);p+=2+i16();break;
case 49:case 50:if(!fit(2))fin(9);if(s.length<1)fin(2);a=s.pop();p+=2+(a==0^op==50?i16():0);break;
case 51:if(!fit(2))fin(9);if(k.length>=64)fin(7);k.push(p+3);p=(g[p+1]|g[p+2]<<8)-1;break;
case 52:if(!k.length)fin(8);p=k.pop()-1;break;
case 64:a=s.pop();if(a&~255)fin(6);push(m[a]);break;
case 65:a=s.pop();if(a&~255)fin(6);m[a]=s.pop();break;
case 80:r=""+s.pop();if(o.length+r.length>65536)fin(11);o.push(...Buffer.from(r));break;
case 81:if(o.length>=65536)fin(11);o.push(s.pop()&255);break;
case 82:if(!push(j<q.length?q[j++]:-1))fin(3);break;
case 83:fin(s.pop()&255);
default:if(op<16||op>34)fin(5);b=s.pop();a=s.pop();if((op-19)>>>0<4&&b==0)fin(4);r=op==16?a+b:op==17?a-b:op==18?Math.imul(a,b):op==19?a/b:op==20?a%b:op==21?(a>>>0)/(b>>>0):op==22?(a>>>0)%(b>>>0):op==24?a&b:op==25?a|b:op==26?a^b:op==28?a<<(b&31):op==29?a>>(b&31):op==30?a>>>(b&31):op==32?a==b:op==33?a<b:(a>>>0)<(b>>>0);push(r);break;
}
}
fin(10);
}
for(let k=1;k<41;k++){
const id="i0"+(k<10?"0":"")+k;let w;
try{run(rb(D+"/"+id+"/program.bin"),rb(D+"/"+id+"/input.bin"))}catch(e){w=e}
M(E+"/"+id,{recursive:true});
W(E+"/"+id+"/stdout.bin",w[0]);
W(E+"/"+id+"/exit.txt",w[1]+"\n");
}
