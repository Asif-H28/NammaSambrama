import { chromium } from 'playwright'
const dir='/private/tmp/claude-501/-Users-asifh-Desktop-NewFolderr/fc65be52-d920-4f70-a610-eda54c62a119/scratchpad'
const b=await chromium.launch()
for (const [tag,w,h] of [['desk',1440,900],['mob',390,844]]) {
  const p=await b.newPage({viewport:{width:w,height:h}})
  const errs=[]; p.on('pageerror',e=>errs.push(String(e)))
  await p.goto('http://localhost:5633/public',{waitUntil:'networkidle'})
  await p.waitForTimeout(3200)
  const m=await p.evaluate(()=>{
    const h1=document.querySelector('h1')
    const prom=document.querySelector('#promise').getBoundingClientRect()
    return {cards:document.querySelectorAll('.hd-card').length,
      h1Font:getComputedStyle(h1).fontFamily.split(',')[0],
      h1Style:getComputedStyle(h1).fontStyle,
      promiseHidden:prom.top>=window.innerHeight-20,
      ov:document.documentElement.scrollWidth>window.innerWidth+1}
  })
  console.log(tag,JSON.stringify(m), errs.length?errs.slice(0,1):'')
  await p.screenshot({path:`${dir}/hd-${tag}.png`})
  await p.close()
}
await b.close()
