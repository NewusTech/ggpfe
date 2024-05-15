import{_ as Z,m as ee,a as te,u as ae,r as m,w as oe,n as le,l as se,j as O,q as de,d as _,o as f,e as E,f as a,g as o,s as t,t as d,y as i,v as j,x as V,p as ne,i as ie}from"./index-2eb3e8c7.js";const c=R=>(ne("data-v-6d06c84e"),R=R(),ie(),R),re={class:"grid mt-1"},ce={class:"col-12"},ue={class:"card"},me=c(()=>a("div",{class:"my-2"},[a("h5",{class:"m-0"},"Outbound")],-1)),he={class:"flex flex-column md:flex-row md:justify-content-between md:align-items-center"},fe={class:"block mt-2 md:mt-0 p-input-icon-left"},ye=c(()=>a("i",{class:"pi pi-search"},null,-1)),_e={class:"block mt-2 md:mt-0 p-input-icon-left"},pe=c(()=>a("div",{class:"flex flex-column md:flex-row md:justify-content-between md:align-items-center",style:{"text-align":"center",width:"100%"}},[a("span",{style:{width:"100%"}},"No")],-1)),we=c(()=>a("div",{class:"flex flex-column md:flex-row md:justify-content-between md:align-items-center",style:{"text-align":"center",width:"90%"}},[a("span",{style:{width:"100%"}},"Code")],-1)),ve=c(()=>a("div",{class:"flex flex-column md:flex-row md:justify-content-between md:align-items-center",style:{"text-align":"center",width:"90%"}},[a("span",{style:{width:"100%"}},"Date")],-1)),ge=c(()=>a("div",{class:"flex flex-column md:flex-row md:justify-content-between md:align-items-center",style:{"text-align":"center",width:"90%"}},[a("span",{style:{width:"100%"}},"Reference Doc")],-1)),xe=c(()=>a("div",{class:"flex flex-column md:flex-row md:justify-content-between md:align-items-center",style:{"text-align":"center",width:"90%"}},[a("span",{style:{width:"100%"}},"Type")],-1)),be=c(()=>a("div",{class:"flex flex-column md:flex-row md:justify-content-between md:align-items-center",style:{"text-align":"center",width:"90%"}},[a("span",{style:{width:"100%"}},"Storage Location")],-1)),Se=c(()=>a("div",{class:"flex flex-column md:flex-row md:justify-content-between md:align-items-center",style:{"text-align":"center",width:"90%"}},[a("span",{style:{width:"100%"}},"Movement Type")],-1)),ke=c(()=>a("div",{class:"flex flex-column md:flex-row md:justify-content-between md:align-items-center",style:{"text-align":"center",width:"90%"}},[a("span",{style:{width:"100%"}},"Good Recipient")],-1)),je=c(()=>a("div",{class:"flex flex-column md:flex-row md:justify-content-between md:align-items-center",style:{"text-align":"center",width:"90%"}},[a("span",{style:{width:"100%"}},"Receiving S. Loc")],-1)),Re=c(()=>a("div",{class:"flex flex-column md:flex-row md:justify-content-between md:align-items-center",style:{"text-align":"center",width:"100%"}},[a("span",{style:{width:"100%"}},"Status")],-1)),Te={key:0,style:{color:"green"}},Pe={key:1,class:"text-primary"},Ce=c(()=>a("div",{class:"field"},[a("label",{for:"material_code"},"Choose your data to release")],-1)),De=c(()=>a("div",{class:"flex flex-column md:flex-row md:justify-content-between md:align-items-center",style:{"text-align":"center",width:"90%"}},[a("span",{style:{width:"100%"}},"Code")],-1)),Ie=c(()=>a("div",{class:"flex flex-column md:flex-row md:justify-content-between md:align-items-center",style:{"text-align":"center",width:"90%"}},[a("span",{style:{width:"100%"}},"Date")],-1)),Ae=c(()=>a("div",{class:"flex flex-column md:flex-row md:justify-content-between md:align-items-center",style:{"text-align":"center",width:"90%"}},[a("span",{style:{width:"100%"}},"Reference Doc")],-1)),Oe=c(()=>a("div",{class:"flex flex-column md:flex-row md:justify-content-between md:align-items-center",style:{"text-align":"center",width:"90%"}},[a("span",{style:{width:"100%"}},"Type")],-1)),Ee=c(()=>a("div",{class:"flex flex-column md:flex-row md:justify-content-between md:align-items-center",style:{"text-align":"center",width:"90%"}},[a("span",{style:{width:"100%"}},"Storage Location")],-1)),Fe=c(()=>a("div",{class:"flex flex-column md:flex-row md:justify-content-between md:align-items-center",style:{"text-align":"center",width:"90%"}},[a("span",{style:{width:"100%"}},"Movement Type")],-1)),Be=c(()=>a("div",{class:"flex flex-column md:flex-row md:justify-content-between md:align-items-center",style:{"text-align":"center",width:"90%"}},[a("span",{style:{width:"100%"}},"Good Recipient")],-1)),Le=c(()=>a("div",{class:"flex flex-column md:flex-row md:justify-content-between md:align-items-center",style:{"text-align":"center",width:"90%"}},[a("span",{style:{width:"100%"}},"Receiving S. Loc")],-1)),Me=c(()=>a("div",{class:"flex flex-column md:flex-row md:justify-content-between md:align-items-center",style:{"text-align":"center",width:"100%"}},[a("span",{style:{width:"100%"}},"Status")],-1)),Ne={class:"text-primary"},Ue={class:"p-1"},$e={key:1,class:"text-center m-0 p-0"},qe={__name:"OutboundPage",setup(R){const T=ee(),M=te(),P=ae(),g=m(null),N=m(null),F=m(null),x=m([]),U=m([]),p=m(null),C=m({}),D=m(null),w=m(null),z=m(0),G=m(null),b=m(!1),$=m(""),S=m(),k=m(),q=m([]),K=()=>{const n=S.value.map(l=>l.materials).flat();k.value=[...n]};oe(()=>S.value,()=>{K()});const I=async n=>{n.page+=1;try{const l=`${O}/api/outbound?page=${n.page}&sortField=${n.sortField}&sortOrder=${n.sortOrder}&search=${w.value!=null?w.value:""}`,r=await fetch(l,{method:"GET",headers:{"Content-Type":"application/json",Authorization:`Bearer ${localStorage.getItem("token")}`}}),h=await r.json();if(D.value=h.data.total,r.ok)x.value=h.data.data;else throw new Error(h.error||"Failed to fetch data from API")}catch(l){console.error("Error fetching data from API:",l),P.add({severity:"error",summary:"Error",detail:"Failed to fetch data from API",life:5e3})}},H=n=>{var l,r;n.target.value?w.value=n.target.value:w.value="",I({page:0,search:w.value,sortField:(l=p.value)==null?void 0:l.sortField,sortOrder:(r=p.value)==null?void 0:r.sortOrder})};le(async()=>{const n=T.state.department_name,l=T.state.department_id;n!==null?(N.value=n,F.value=l):(T.watch(r=>r.department_id,r=>{F.value=r}),T.watch(r=>r.department_name,r=>{N.value=r})),J(),g.value=M.currentRoute.value.meta?M.currentRoute.value.meta.dataToSend.value:null});const B=n=>{if(n){const l=new Date(n),r={year:"numeric",month:"2-digit",day:"2-digit"};return l.toLocaleDateString(void 0,r)}else return"-"};se(async()=>{try{const l=await(await fetch(`${O}/api/auth/get_user/`,{method:"GET",headers:{"Content-Type":"application/json",Authorization:`Bearer ${localStorage.getItem("token")}`}})).json();F.value=l.data.departement_id;const r=`${O}/api/outbound`,h=await fetch(r,{method:"GET",headers:{"Content-Type":"application/json",Authorization:`Bearer ${localStorage.getItem("token")}`}}),y=await h.json();if(h.ok)x.value=y.data.data,D.value=y.data.total;else throw new Error(y.error||"Failed to fetch data from API")}catch(n){console.error("Error fetching data from API:",n),P.add({severity:"error",summary:"Error",detail:"Failed to fetch data from API",life:5e3})}});const J=()=>{C.value={global:{value:null,matchMode:de.CONTAINS}}},Q=()=>{U.value=x.value.filter(n=>n.status===1||n.status===2).map(n=>({...n,materials:n.materials.filter(l=>l.status===2)})),b.value=!0,$.value="Release to SAP"},W=()=>{b.value=!1},X=async()=>{var n,l;try{const r=k.value.map(s=>s.id),h=`${O}/api/outbound/release`,y=await fetch(h,{method:"POST",headers:{"Content-Type":"application/json",Authorization:`Bearer ${localStorage.getItem("token")}`},body:JSON.stringify({selectedIds:r})}),v=await y.json();if(y.ok)b.value=!1,S.value=[],k.value=[],I({page:0,search:w.value,sortField:(n=p.value)==null?void 0:n.sortField,sortOrder:(l=p.value)==null?void 0:l.sortOrder}),P.add({severity:"success",summary:"Success",detail:v.message,life:5e3});else throw new Error(v.error||"Failed to release data")}catch(r){console.error("Error releasing data:",r),P.add({severity:"error",summary:"Error",detail:"Failed to release data",life:5e3})}};return(n,l)=>{const r=_("Toast"),h=_("Toolbar"),y=_("InputText"),v=_("Button"),s=_("Column"),A=_("router-link"),L=_("DataTable"),Y=_("Dialog");return f(),E("div",re,[a("div",ce,[a("div",ue,[o(r),o(h,{class:"mb-4 p-0",style:{border:"none","background-color":"white"}},{start:t(()=>[me]),_:1}),a("pre",null,d(x.value),1),o(L,{ref_key:"dt",ref:p,value:x.value,lazy:"",filters:C.value,first:z.value,onPage:l[2]||(l[2]=e=>I(e)),last:D.value,loading:G.value,totalRecords:D.value,dataKey:"id",class:"p-datatable-gridlines",paginator:!0,onSort:l[3]||(l[3]=e=>I(e)),rows:10,paginatorTemplate:"FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown",rowsPerPageOptions:[5,10,25],currentPageReportTemplate:"Showing {first} to {last} of {totalRecords} datamaster",responsiveLayout:"scroll"},{header:t(()=>[a("div",he,[a("span",fe,[ye,o(y,{modelValue:C.value.global.value,"onUpdate:modelValue":l[0]||(l[0]=e=>C.value.global.value=e),placeholder:"Search...",onInput:l[1]||(l[1]=e=>H(e))},null,8,["modelValue"])]),a("span",_e,[o(v,{label:"Release to SAP",class:"p-button-primary mr-2",onClick:Q})])])]),default:t(()=>[o(s,{field:"rowIndex",headerStyle:"width:5%;",style:{"text-align":"center"}},{header:t(()=>[pe]),body:t(e=>[i(d(e.index+1),1)]),_:1}),o(s,{field:"code",headerStyle:"width:10%;"},{header:t(()=>[we]),body:t(e=>[g.value!=="request"?(f(),j(A,{key:0,to:"/outbound/"+e.data.id,class:"text-primary"},{default:t(()=>[i(d(e.data.code),1)]),_:2},1032,["to"])):g.value==="request"?(f(),j(A,{key:1,to:"/outbound-request/"+e.data.id,class:"text-primary"},{default:t(()=>[i(d(e.data.code),1)]),_:2},1032,["to"])):V("",!0)]),_:1}),o(s,{field:"date",headerStyle:"width:10%;"},{header:t(()=>[ve]),body:t(e=>[i(d(B(e.data.created_at)),1)]),_:1}),o(s,{field:"reference_type",headerStyle:"width:10%;"},{header:t(()=>[ge]),body:t(e=>[i(d(e.data.ref_code),1)]),_:1}),o(s,{field:"type",headerStyle:"width:10%;"},{header:t(()=>[xe]),body:t(e=>[i(d(e.data.ref_type),1)]),_:1}),o(s,{field:"s_loc",headerStyle:"width:10%;"},{header:t(()=>[be]),body:t(e=>[i(d(e.data.s_loc),1)]),_:1}),o(s,{field:"mvt_code",headerStyle:"width:10%;"},{header:t(()=>[Se]),body:t(e=>[i(d(e.data.mvt_code),1)]),_:1}),o(s,{field:"good_recepient",headerStyle:"width:10%;"},{header:t(()=>[ke]),body:t(e=>[i(d(e.data.good_recepient),1)]),_:1}),o(s,{field:"receiving_s_loc",headerStyle:"width:15%;"},{header:t(()=>[je]),body:t(e=>[i(d(e.data.receiving_s_loc),1)]),_:1}),o(s,{style:{"text-align":"center"},field:"status",headerStyle:"width:10%;"},{header:t(()=>[Re]),body:t(e=>[e.data.status==2?(f(),E("p",Te,"Complete")):(f(),E("p",Pe,"On Progress"))]),_:1})]),_:1},8,["value","filters","first","last","loading","totalRecords"]),o(Y,{visible:b.value,"onUpdate:visible":l[7]||(l[7]=e=>b.value=e),style:{width:"85%"},header:$.value,modal:!0,class:"p-fluid"},{footer:t(()=>[o(v,{label:"Cancel",icon:"pi pi-times",onClick:W,style:{background:"white",color:"blue"}}),o(v,{label:"Release",icon:"pi pi-check",class:"p-button-primary",onClick:X})]),default:t(()=>[Ce,o(L,{ref_key:"dt",ref:p,selection:S.value,"onUpdate:selection":l[5]||(l[5]=e=>S.value=e),value:U.value,expandedRows:q.value,"onUpdate:expandedRows":l[6]||(l[6]=e=>q.value=e),dataKey:"id",class:"p-datatable-gridlines",responsiveLayout:"scroll"},{expansion:t(e=>[a("div",Ue,[e.data.materials.length>0?(f(),j(L,{key:0,selection:k.value,"onUpdate:selection":l[4]||(l[4]=u=>k.value=u),value:e.data.materials,responsiveLayout:"scroll"},{default:t(()=>[o(s,{selectionMode:"multiple",headerStyle:"width: 3rem"}),o(s,{field:"code",header:"Material Code"},{body:t(u=>[i(d(u.data.code),1)]),_:2},1024),o(s,{field:"desc",header:"Material Desciption"},{body:t(u=>[i(d(u.data.desc),1)]),_:2},1024),o(s,{field:"plant",header:"Plant"},{body:t(u=>[i(d(u.data.plant),1)]),_:2},1024),o(s,{field:"qty",header:"Qty"},{body:t(u=>[i(d(u.data.qty),1)]),_:2},1024),o(s,{field:"uom",header:"UoM"},{body:t(u=>[i(d(u.data.uom),1)]),_:2},1024),o(s,{field:"sbin",header:"Storage Bin"},{body:t(u=>[i(d(u.data.sbin),1)]),_:2},1024),o(s,{field:"batch",header:"Batch"},{body:t(u=>[i(d(u.data.batch),1)]),_:2},1024),o(s,{field:"qty",header:"Requirement Date"},{body:t(u=>[i(d(B(u.data.date)),1)]),_:2},1024)]),_:2},1032,["selection","value"])):(f(),E("div",$e," No materials available for this item. "))])]),default:t(()=>[o(s,{selectionMode:"multiple",headerStyle:"width: 3rem"}),o(s,{field:"code",headerStyle:"width:10%;"},{header:t(()=>[De]),body:t(e=>[g.value!=="request"?(f(),j(A,{key:0,to:"/outbound/"+e.data.id,class:"text-primary"},{default:t(()=>[i(d(e.data.code),1)]),_:2},1032,["to"])):g.value==="request"?(f(),j(A,{key:1,to:"/outbound-request/"+e.data.id,class:"text-primary"},{default:t(()=>[i(d(e.data.code),1)]),_:2},1032,["to"])):V("",!0)]),_:1}),o(s,{field:"date",headerStyle:"width:10%;"},{header:t(()=>[Ie]),body:t(e=>[i(d(B(e.data.created_at)),1)]),_:1}),o(s,{field:"ref_code",headerStyle:"width:10%;"},{header:t(()=>[Ae]),body:t(e=>[i(d(e.data.ref_code),1)]),_:1}),o(s,{field:"ref_type",headerStyle:"width:10%;"},{header:t(()=>[Oe]),body:t(e=>[i(d(e.data.ref_type),1)]),_:1}),o(s,{field:"s_loc",headerStyle:"width:10%;"},{header:t(()=>[Ee]),body:t(e=>[i(d(e.data.s_loc),1)]),_:1}),o(s,{field:"mvt_code",headerStyle:"width:10%;"},{header:t(()=>[Fe]),body:t(e=>[i(d(e.data.mvt_code),1)]),_:1}),o(s,{field:"good_recepient",headerStyle:"width:10%;"},{header:t(()=>[Be]),body:t(e=>[i(d(e.data.good_recepient),1)]),_:1}),o(s,{field:"receiving_s_loc",headerStyle:"width:15%;"},{header:t(()=>[Le]),body:t(e=>[i(d(e.data.receiving_s_loc),1)]),_:1}),o(s,{style:{"text-align":"center"},field:"status",headerStyle:"width:10%;"},{header:t(()=>[Me]),body:t(e=>[a("p",Ne,d(e.data.status===2?"Complete":"On Progress"),1)]),_:1}),o(s,{header:"Action",expander:!0,headerStyle:"min-width: 3rem"})]),_:1},8,["selection","value","expandedRows"])]),_:1},8,["visible","header"])])])])}}},ze=Z(qe,[["__scopeId","data-v-6d06c84e"]]);export{ze as default};