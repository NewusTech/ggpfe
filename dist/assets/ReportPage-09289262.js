import{m as D,r as l,u as x,w as U,n as P,l as L,j as S,q as M,d as c,o as k,e as I,g as r,f as a,s as T,t as A,F as N}from"./index-2eb3e8c7.js";const R={class:"grid mt-1"},z={class:"col-12"},G={class:"card"},q=a("div",{class:"my-2"},[a("h5",{class:"m-0"},"Report")],-1),H={class:"grid p-fluid"},J={class:"field col-12 md:col-6 lg:col-3"},K=a("label",{for:"s_loc",class:"mb-3"},"Start Date",-1),Q={class:"field col-12 md:col-6 lg:col-3"},W=a("label",{for:"s_loc",class:"mb-3"},"End Date",-1),X={class:"field col-12 md:col-6 lg:col-4"},Y=a("label",{for:"s_loc",class:"mb-3"},"Storage Location",-1),Z={key:0},ee={key:1},oe={class:"field col-12 md:col-6 lg:col-2"},te=a("label",{for:"s_loc",class:"mb-3 text-white"},"a",-1),ne={__name:"ReportPage",setup(ae){D(),l(null),l(null);const h=l(null),B=l([{name:"Inbound",value:"Inbound"},{name:"Outbound",value:"Outbound"},{name:"Stock Opname",value:"Stock Opname"},{name:"Adjustment",value:"Adjustment"}]),b=x(),F=l([]),E=l(null),O=l({});l(null);const g=l(null),y=l([]),i=l(null),d=l(null),u=l(null),m=l("inbound");U(h,async(o,e)=>{o.value==="Outbound"?m.value="outbound":o.value==="Inbound"?m.value="inbound":o.value==="Stock Opname"?m.value="stock_opname":o.value==="Adjustment"&&(m.value="adjustment")});const V=async o=>{try{const e=u&&u.value?new Date(u.value):null,n=e?e.toISOString().split("T")[0]:null,v=d&&d.value?new Date(d.value):null,f=v?v.toISOString().split("T")[0]:null;let s=`${S}/api/report/${m.value}?`;i.value&&i.value.id&&(s+=`s_loc_id=${i.value.id}&`),n&&(s+=`start_date=${n}&`),f&&(s+=`end_date=${f}&`);const _=await fetch(s,{method:"GET",headers:{"Content-Type":"application/json",Authorization:`Bearer ${localStorage.getItem("token")}`}});if(_.ok){const w=await _.blob(),t=window.URL.createObjectURL(new Blob([w])),p=document.createElement("a");p.href=t,p.setAttribute("download","report.xlsx"),document.body.appendChild(p),p.click(),document.body.removeChild(p)}else throw new Error(data.error||"Failed to fetch data from API")}catch(e){console.error("Error fetching data from API:",e),b.add({severity:"error",summary:"Error",detail:"Failed to fetch data from API",life:5e3})}},j=o=>{var e,n;o.target.value?g.value=o.target.value:g.value="",V({page:0,search:g.value,sortField:(e=E.value)==null?void 0:e.sortField,sortOrder:(n=E.value)==null?void 0:n.sortOrder})};P(()=>{C()}),L(async()=>{try{const o=await fetch(`${S}/api/master/storage_location`,{method:"GET",headers:{"Content-Type":"application/json",Authorization:`Bearer ${localStorage.getItem("token")}`}}),e=await o.json();if(o.ok)y.value=e.data.data;else throw new Error(e.error||"Failed to fetch storage location data from API")}catch(o){console.error("Error fetching data from API:",o),b.add({severity:"error",summary:"Error",detail:"Failed to fetch data from API",life:5e3})}});const C=()=>{O.value={global:{value:null,matchMode:M.CONTAINS}}},$=async o=>{try{const e=await fetch(`${S}/api/sloc/master_storage_location?search=${o.value}&paginate_count=15`,{method:"GET",headers:{"Content-Type":"application/json",Authorization:`Bearer ${localStorage.getItem("token")}`}}),n=await e.json();if(e.ok)y.value=n.data.data;else throw new Error(n.error||"Failed to fetch storage location data from API")}catch{b.add({severity:"error",summary:"Error",detail:"Failed to fetch storage locations",life:5e3})}};return(o,e)=>{const n=c("SelectButton"),v=c("Toast"),f=c("Toolbar"),s=c("Calendar"),_=c("Dropdown"),w=c("Button");return k(),I(N,null,[r(n,{modelValue:h.value,"onUpdate:modelValue":e[0]||(e[0]=t=>h.value=t),options:B.value,optionLabel:"name","aria-labelledby":"multiple"},null,8,["modelValue","options"]),a("div",R,[a("div",z,[a("div",G,[r(v),r(f,{class:"mb-4 p-0",style:{border:"none","background-color":"white"}},{start:T(()=>[q]),_:1}),a("pre",null,A(F.value),1),a("div",H,[a("div",J,[K,r(s,{modelValue:u.value,"onUpdate:modelValue":e[1]||(e[1]=t=>u.value=t),class:"w-full",showIcon:"",iconDisplay:"input"},null,8,["modelValue"])]),a("div",Q,[W,r(s,{modelValue:d.value,"onUpdate:modelValue":e[2]||(e[2]=t=>d.value=t),class:"w-full",showIcon:"",iconDisplay:"input"},null,8,["modelValue"])]),a("div",X,[Y,r(_,{id:"s_loc",modelValue:i.value,"onUpdate:modelValue":e[3]||(e[3]=t=>i.value=t),options:y.value,optionLabel:"name",placeholder:"Pilih filter",onFilter:$,filter:""},{value:T(t=>[t.value&&t.value.id?(k(),I("div",Z,A(t.value.name),1)):(k(),I("span",ee,A(t.placeholder),1))]),_:1},8,["modelValue","options"])]),a("div",oe,[te,r(w,{label:"Submit",class:"p-button-primary mr-2",onClick:e[4]||(e[4]=t=>j(t))})])])])])])],64)}}};export{ne as default};