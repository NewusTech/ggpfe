import{_ as b,u as w,a as y,b as k,r as c,c as S,d as n,o as T,e as I,f as e,g as a,F as V,h as j,p as B,i as E,j as p}from"./index-2eb3e8c7.js";const L="/demo/images/login/avatar.png";const u=t=>(B("data-v-dbed2a0f"),t=t(),E(),t),C={class:"surface-ground flex align-items-center justify-content-center min-h-screen min-w-screen overflow-hidden"},P={class:"flex flex-column align-items-center justify-content-center"},U={style:{"border-radius":"56px",padding:"0.3rem",background:"linear-gradient(180deg, var(--primary-color) 10%, rgba(33, 150, 243, 0) 30%)"}},$={class:"w-full surface-card py-8 px-5 sm:px-8",style:{"border-radius":"53px"}},N=u(()=>e("div",{class:"text-center mb-5"},[e("img",{src:L,alt:"Image",height:"50",class:"mb-3"}),e("div",{class:"text-900 text-3xl font-medium mb-3"},"Welcome"),e("span",{class:"text-600 font-medium"},"Sign in to continue")],-1)),R=u(()=>e("label",{for:"email1",class:"block text-900 text-xl font-medium mb-2"},"Email",-1)),A=u(()=>e("label",{for:"password1",class:"block text-900 font-medium text-xl mb-2"},"Password",-1)),F={__name:"Login",setup(t){const _=w(),g=y(),{layoutConfig:f}=k(),l=c(""),r=c("");c(!1),S(()=>`layout/images/${f.darkTheme.value?"logo-white":"logo-dark"}.svg`);const h=async()=>{try{const s=await fetch(`${p}/api/auth/login/`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({email:l.value,password:r.value})}),o=await s.json();if(s.ok){localStorage.setItem("token",o.data.token),console.log("Login success:",o);const d=await(await fetch(`${p}/api/auth/get_user/`,{method:"GET",headers:{"Content-Type":"application/json",Authorization:`Bearer ${o.data.token}`}})).json();console.log("tol",d.data),g.push({name:"dashboard"})}else console.error("Login failed:",o.message),_.add({severity:"error",summary:"Gagal Login",detail:"Email atau Password salah",life:1e4})}catch(s){console.error("An error occurred:",s)}};return(s,o)=>{const m=n("Toast"),d=n("InputText"),x=n("Password"),v=n("Button");return T(),I(V,null,[e("div",C,[e("div",P,[a(m),e("div",U,[e("div",$,[N,e("div",null,[R,a(d,{id:"email1",type:"text",placeholder:"Email address",class:"w-full md:w-30rem mb-5",style:{padding:"1rem"},modelValue:l.value,"onUpdate:modelValue":o[0]||(o[0]=i=>l.value=i)},null,8,["modelValue"]),A,a(x,{id:"password1",modelValue:r.value,"onUpdate:modelValue":o[1]||(o[1]=i=>r.value=i),placeholder:"Password",toggleMask:!0,class:"w-full mb-3",inputClass:"w-full",inputStyle:{padding:"1rem"},feedback:!1},null,8,["modelValue"]),a(v,{label:"Sign In",class:"w-full p-3 text-xl",onClick:h})])])])])]),a(j,{simple:""})],64)}}},O=b(F,[["__scopeId","data-v-dbed2a0f"]]);export{O as default};