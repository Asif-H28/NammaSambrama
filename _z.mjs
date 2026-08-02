import { chromium } from 'playwright'
const b=await chromium.launch()
const p=await b.newPage({viewport:{width:1440,height:900}})
await p.goto('http://localhost:5639/public',{waitUntil:'networkidle'})
await p.waitForTimeout(2500)
const m=await p.evaluate(()=>{
  const hero=document.querySelector('.ps-hero')
  const kids=[...hero.children].map(c=>({
    cls:(c.className||'').toString().slice(0,34),
    tag:c.tagName,
    z:getComputedStyle(c).zIndex,
    pos:getComputedStyle(c).position }))
  return kids
})
console.log(JSON.stringify(m,null,1))
await b.close()
