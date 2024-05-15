import{m as Z,r as d,u as ee,n as te,l as ae,j as k,q as se,d as y,o as u,e as w,f as r,g as i,s as n,v as O,x as g,y as x,t as _,z as B}from"./index-2eb3e8c7.js";const oe={class:"grid"},le={class:"col-12"},re={class:"card"},ne=r("div",{class:"my-2"},[r("h5",{class:"m-0"},"Master Cost Center")],-1),ie={class:"flex flex-column md:flex-row md:justify-content-between md:align-items-center"},de={class:"block mt-2 md:mt-0 p-input-icon-left"},ce=r("i",{class:"pi pi-search"},null,-1),ue=r("div",{class:"flex flex-column md:flex-row md:justify-content-between md:align-items-center",style:{"text-align":"center",width:"100%"}},[r("span",{style:{width:"100%"}},"No")],-1),me=r("div",{class:"flex flex-column md:flex-row md:justify-content-between md:align-items-center",style:{"text-align":"center",width:"100%"}},[r("span",{style:{width:"100%"}},"Cost Center")],-1),pe=r("div",{class:"flex flex-column md:flex-row md:justify-content-between md:align-items-center",style:{"text-align":"center",width:"100%"}},[r("span",{style:{width:"100%"}},"Description")],-1),ve=r("div",{class:"flex flex-column md:flex-row md:justify-content-between md:align-items-center",style:{"text-align":"center",width:"100%"}},[r("span",{style:{width:"100%"}},"Department")],-1),fe=r("div",{class:"flex flex-column md:flex-row md:justify-content-between md:align-items-center",style:{"text-align":"center",width:"100%"}},[r("span",{style:{width:"100%"}},"Action")],-1),he={class:"field"},ye=r("label",{for:"name"},"Cost Center",-1),we={key:0,class:"p-invalid"},ge={class:"field"},_e=r("label",{for:"desc"},"Description",-1),be={key:0,class:"p-invalid"},Ce={class:"field"},ke=r("label",{for:"department",class:"mb-3"},"Department",-1),xe={key:0},De={key:1},Se={key:0,class:"p-invalid"},Te={class:"flex align-items-center justify-content-center"},Fe=r("i",{class:"pi pi-exclamation-triangle mr-3",style:{"font-size":"2rem"}},null,-1),Pe={key:0},Ee={__name:"CostPage",setup($e){const N=Z(),p=d(null),v=ee(),P=d(null),$=d(null),j=d(null),E=d([]),I=d(""),b=d(!1),D=d(!1),t=d({}),c=d(null),T=d({}),m=d(!1),A=d([]),F=d(null),f=d(null),C=async s=>{s.page+=1;try{const e=await fetch(`${k}/api/master/cost_center?page=${s.page}&sortField=${s.sortField}&sortOrder=${s.sortOrder}&search=${f.value!=null?f.value:""}&paginate_count=${s.rows}`,{method:"GET",headers:{"Content-Type":"application/json",Authorization:`Bearer ${localStorage.getItem("token")}`}}),l=await e.json();if(F.value=l.data.total,e.ok)E.value=l.data;else throw new Error(l.error||"Failed to fetch data from API")}catch{v.add({severity:"error",summary:"Error",detail:"Failed to fetch data from API",life:5e3})}},z=s=>{var e,l,o;s.target.value?f.value=s.target.value:f.value="",C({page:0,search:f.value,sortField:(e=c.value)==null?void 0:e.sortField,sortOrder:(l=c.value)==null?void 0:l.sortOrder,rows:(o=c.value)==null?void 0:o.rows})};te(()=>{const s=N.state.permission;s!==null?(p.value=s,P.value=p.value.some(e=>e.name==="create-master"),$.value=p.value.some(e=>e.name==="edit-master"),j.value=p.value.some(e=>e.name==="delete-master")):N.watch(e=>e.permission,e=>{p.value=e,P.value=p.value.some(l=>l.name==="create-master"),$.value=p.value.some(l=>l.name==="edit-master"),j.value=p.value.some(l=>l.name==="delete-master")}),Y()}),ae(async()=>{try{const s=await fetch(`${k}/api/master/cost_center`,{method:"GET",headers:{"Content-Type":"application/json",Authorization:`Bearer ${localStorage.getItem("token")}`}}),e=await s.json();if(s.ok)E.value=e.data,F.value=e.data.total;else throw new Error(e.error||"Failed to fetch data from API");const l=await fetch(`${k}/api/master/department`,{method:"GET",headers:{"Content-Type":"application/json",Authorization:`Bearer ${localStorage.getItem("token")}`}}),o=await l.json();if(l.ok)A.value=o.data.data;else throw new Error(o.error||"Failed to fetch department data from API")}catch{v.add({severity:"error",summary:"Error",detail:"Failed to fetch data from API",life:5e3})}});const L=()=>{t.value={},m.value=!1,b.value=!0,I.value="Add New Cost Center"},U=()=>{b.value=!1,m.value=!1},q=async()=>{var s,e,l;try{const o=await fetch(`${k}/api/master/cost_center/${t.value.id}`,{method:"PUT",headers:{"Content-Type":"application/json",Authorization:`Bearer ${localStorage.getItem("token")}`},body:JSON.stringify({name:t.value.name,desc:t.value.desc,department_id:t.value.department.id})}),h=await o.json();if(o.ok)await C({page:0,search:f.value,sortField:(s=c.value)==null?void 0:s.sortField,sortOrder:(e=c.value)==null?void 0:e.sortOrder,rows:(l=c.value)==null?void 0:l.rows}),v.add({severity:"success",summary:"Successful",detail:"Data Cost Center Updated",life:3e3});else throw new Error(h.error||"Failed to update data Cost Center")}catch(o){v.add({severity:"error",summary:"Failed",detail:o,life:5e3})}},R=async()=>{var s,e,l;try{const o=await fetch(`${k}/api/master/cost_center`,{method:"POST",headers:{"Content-Type":"application/json",Authorization:`Bearer ${localStorage.getItem("token")}`},body:JSON.stringify({name:t.value.name,desc:t.value.desc,department_id:t.value.department.id})}),h=await o.json();if(o.ok)await C({page:0,search:f.value,sortField:(s=c.value)==null?void 0:s.sortField,sortOrder:(e=c.value)==null?void 0:e.sortOrder,rows:(l=c.value)==null?void 0:l.rows}),v.add({severity:"success",summary:"Successful",detail:"Data Cost Center Created",life:3e3});else throw new Error(h.error||"Failed to create data Cost Center")}catch(o){v.add({severity:"error",summary:"Failed",detail:o,life:5e3})}},G=()=>{m.value=!0,t.value.name&&t.value.name.trim()&&t.value.desc&&t.value.desc.trim()&&t.value.department&&t.value.department.id!==null&&(t.value.id?q():R(),b.value=!1,t.value={})},J=s=>{t.value={...s};const e=A.value.find(l=>l.id===t.value.department_id);t.value.department=e,b.value=!0,I.value="Edit Cost Center"},H=s=>{t.value=s,D.value=!0},K=async()=>{var s,e,l;try{const o=await fetch(`${k}/api/master/cost_center/${t.value.id}`,{method:"DELETE",headers:{"Content-Type":"application/json",Authorization:`Bearer ${localStorage.getItem("token")}`}}),h=await o.json();if(o.ok)await C({page:0,search:f.value,sortField:(s=c.value)==null?void 0:s.sortField,sortOrder:(e=c.value)==null?void 0:e.sortOrder,rows:(l=c.value)==null?void 0:l.rows}),D.value=!1,t.value={},v.add({severity:"success",summary:"Successful",detail:"Cost Center Deleted",life:3e3});else throw o.status===500&&h.error.includes("Integrity constraint violation")?new Error("Tidak dapat hapus data ini, karena masih digunakan pada data lain"):new Error(h.error||"Failed to delete Cost Center")}catch(o){v.add({severity:"error",summary:"Error",detail:o.message,life:5e3})}},Y=()=>{T.value={global:{value:null,matchMode:se.CONTAINS}}};return(s,e)=>{const l=y("Toast"),o=y("Button"),h=y("Toolbar"),V=y("InputText"),S=y("Column"),Q=y("DataTable"),W=y("Dropdown"),M=y("Dialog");return u(),w("div",oe,[r("div",le,[r("div",re,[i(l),i(h,{class:"mb-4 p-0",style:{border:"none","background-color":"white"}},{start:n(()=>[ne]),end:n(()=>[P.value?(u(),O(o,{key:0,label:"Add New",icon:"pi pi-plus-circle",class:"p-button-primary mr-2",onClick:L})):g("",!0)]),_:1}),i(Q,{ref_key:"dt",ref:c,value:E.value.data,lazy:"",filters:T.value,first:s.first,onPage:e[2]||(e[2]=a=>C(a)),last:F.value,loading:s.loading,totalRecords:F.value,dataKey:"id",class:"p-datatable-gridlines",paginator:!0,onSort:e[3]||(e[3]=a=>C(a)),rows:10,paginatorTemplate:"FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown",rowsPerPageOptions:[5,10,25],currentPageReportTemplate:"Showing {first} to {last} of {totalRecords} datamaster",responsiveLayout:"scroll"},{header:n(()=>[r("div",ie,[r("span",de,[ce,i(V,{modelValue:T.value.global.value,"onUpdate:modelValue":e[0]||(e[0]=a=>T.value.global.value=a),placeholder:"Search...",onInput:e[1]||(e[1]=a=>z(a))},null,8,["modelValue"])])])]),default:n(()=>[i(S,{field:"rowIndex",headerStyle:"min-width:5%;",style:{"text-align":"center"}},{header:n(()=>[ue]),body:n(a=>[x(_(a.index+1),1)]),_:1}),i(S,{field:"name",headerStyle:"width:20%; min-width:10rem;"},{header:n(()=>[me]),body:n(a=>[x(_(a.data.name),1)]),_:1}),i(S,{field:"desc",headerStyle:"width:30%; min-width:10rem;"},{header:n(()=>[pe]),body:n(a=>[x(_(a.data.desc),1)]),_:1}),i(S,{field:"department",headerStyle:"width:30%; min-width:10rem;"},{header:n(()=>[ve]),body:n(a=>[x(_(a.data.department.name),1)]),_:1}),i(S,{headerStyle:"min-width:10rem;",style:{"text-align":"center"}},{header:n(()=>[fe]),body:n(a=>[$.value?(u(),O(o,{key:0,icon:"pi pi-file-edit",class:"p-button-text p-button-primary mt-2",onClick:X=>J(a.data)},null,8,["onClick"])):g("",!0),j.value?(u(),O(o,{key:1,icon:"pi pi-trash",class:"p-button-text p-button-danger mt-2",onClick:X=>H(a.data)},null,8,["onClick"])):g("",!0)]),_:1})]),_:1},8,["value","filters","first","last","loading","totalRecords"]),i(M,{visible:b.value,"onUpdate:visible":e[7]||(e[7]=a=>b.value=a),style:{width:"450px"},header:I.value,modal:!0,class:"p-fluid"},{footer:n(()=>[i(o,{label:"Cancel",icon:"pi pi-times",onClick:U,style:{background:"white",color:"blue"}}),i(o,{label:"Save",icon:"pi pi-check",class:"p-button-primary",onClick:G})]),default:n(()=>[r("div",he,[ye,i(V,{id:"name",modelValue:t.value.name,"onUpdate:modelValue":e[4]||(e[4]=a=>t.value.name=a),modelModifiers:{trim:!0},required:"true",autofocus:"",class:B({"p-invalid":m.value&&!t.value.name})},null,8,["modelValue","class"]),m.value&&!t.value.name?(u(),w("small",we,"Cost Center is required.")):g("",!0)]),r("div",ge,[_e,i(V,{id:"desc",modelValue:t.value.desc,"onUpdate:modelValue":e[5]||(e[5]=a=>t.value.desc=a),modelModifiers:{trim:!0},required:"true",autofocus:"",class:B({"p-invalid":m.value&&!t.value.desc})},null,8,["modelValue","class"]),m.value&&!t.value.desc?(u(),w("small",be,"Description is required.")):g("",!0)]),r("div",Ce,[ke,i(W,{id:"department",modelValue:t.value.department,"onUpdate:modelValue":e[6]||(e[6]=a=>t.value.department=a),options:A.value,optionLabel:"name",placeholder:"Select a Department",class:B({"p-invalid":m.value&&!t.value.department}),required:"true"},{value:n(a=>[a.value&&a.value.id?(u(),w("div",xe,_(a.value.name),1)):(u(),w("span",De,_(a.placeholder),1))]),_:1},8,["modelValue","options","class"]),m.value&&!t.value.department?(u(),w("small",Se,"Department is required.")):g("",!0)])]),_:1},8,["visible","header"]),i(M,{visible:D.value,"onUpdate:visible":e[9]||(e[9]=a=>D.value=a),style:{width:"450px"},header:"Confirm",modal:!0},{footer:n(()=>[i(o,{label:"No",icon:"pi pi-times",style:{background:"white",color:"red",borderColor:"red"},onClick:e[8]||(e[8]=a=>D.value=!1)}),i(o,{label:"Yes",icon:"pi pi-check",class:"p-button-primary",onClick:K})]),default:n(()=>[r("div",Te,[Fe,t.value?(u(),w("span",Pe,[x("Are you sure you want to delete "),r("b",null,_(t.value.cost_center),1),x("?")])):g("",!0)])]),_:1},8,["visible"])])])])}}};export{Ee as default};
