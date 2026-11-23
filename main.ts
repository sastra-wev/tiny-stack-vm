import{mkdirSync as M,readFileSync as R,writeFileSync as W}from"fs";
const D=process.env.MAKEFUN_INPUT_DIR??"/input",E=process.env.MAKEFUN_OUTPUT_DIR??"/output",T="000112230000000022222221222122222220000000000000000000000000000012000000000000001101",rb=f=>{try{return R(f)}catch{return[]}};
function run(g,q){
const s=[],k=[],m={},o=[];
let p=0,j=0,t=0,a,b,r;
const fin=c=>{throw[Buffer.from(o),c]},push=v=>s.length<256&&s.push(v|0),P=v=>push(v)||fin(3),F=n=>p+n<g.length||fin(9),i16=()=>g.readInt16LE(p+1);
for(;t<1e6;t++,p++){
if(p>>>0>=g.length)fin(9);
const op=g[p];
if(s.length<T[op])fin(2);
switch(op){
case 0:fin(0);
case 1:F(1);P(g[p+1]<<24>>24);p++;break;
case 2:F(4);P(g.readInt32LE(p+1));p+=4;break;
case 3:s.pop();break;
case 4:P(s.at(-1));break;
case 5:s.push(s.pop(),s.pop());break;
case 6:P(s.at(-2));break;
case 7:s.push(s.splice(-3,1)[0]);break;
case 23:case 27:P(op<24?-s.pop():~s.pop());break;
case 48:F(2);p+=2+i16();break;
case 49:case 50:F(2);s.length||fin(2);a=s.pop();p+=2+(a==0^op==50?i16():0);break;
case 51:F(2);if(k.length>63)fin(7);k.push(p+3);p=(i16()&65535)-1;break;
case 52:if(!k.length)fin(8);p=k.pop()-1;break;
case 64:case 65:a=s.pop();if(a&~255)fin(6);op>64?m[a]=s.pop():P(m[a]);break;
case 80:r=""+s.pop();if(o.length+r.length>65536)fin(11);o.push(...Buffer.from(r));break;
case 81:if(o.length>65535)fin(11);o.push(s.pop()&255);break;
case 82:P(q[j++]??-1);break;
case 83:fin(s.pop()&255);
default:if(op<16||op>34)fin(5);b=s.pop();a=s.pop();if((op-19)>>>0<4&&b==0)fin(4);P([a+b,a-b,Math.imul(a,b),a/b,a%b,(a>>>0)/(b>>>0),(a>>>0)%(b>>>0),,a&b,a|b,a^b,,a<<(b&31),a>>(b&31),a>>>(b&31),(a>>>0)<(b>>>0),a==b,a<b,(a>>>0)<(b>>>0)][op-16]);break;
}
}
fin(10);
}
for(let n=1;n<41;n++){
const d="i0"+(n<10?0:"")+n,y=D+"/"+d+"/",z=E+"/"+d+"/";let w;
try{run(rb(y+"program.bin"),rb(y+"input.bin"))}catch(e){w=e}
M(z,{recursive:true});
W(z+"stdout.bin",w[0]);
W(z+"exit.txt",w[1]+"\n");
}
