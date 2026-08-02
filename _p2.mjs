import { chromium } from 'playwright'
const dir='/private/tmp/claude-501/-Users-asifh-Desktop-NewFolderr/fc65be52-d920-4f70-a610-eda54c62a119/scratchpad'
const b=await chromium.launch()
for (const [tag,w] of [['desk',1440],['mob',390]]) {
  const p=await b.newPage({viewport:{width:w,height:1000}})
  const errs=[]; p.on('pageerror',e=>errs.push(String(e)))
  await p.goto('http://localhost:5623/public',{waitUntil:'networkidle'})
  await p.waitForTimeout(2600)
  const m=await p.evaluate(()=>{
    const sec=document.querySelector('.pr-sec')
    const cards=[...document.querySelectorAll('.pr-card')]
    return {cards:cards.length, secH:Math.round(sec.getBoundingClientRect().height),
      cardH:Math.round(cards[0].getBoundingClientRect().height),
      bg:getComputedStyle(sec).backgroundColor,
      ov:document.documentElement.scrollWidth>window.innerWidth+1}
  })
  console.log(tag,JSON.stringify(m))
  console.log('  errors:',errs.length?errs.slice(0,1):'none')
  await p.evaluate(()=>document.querySelector('.pr-sec')?.scrollIntoView({block:'center'}))
  await p.waitForTimeout(900)
  await p.screenshot({path:`${dir}/pr2-${tag}.png`})
  await p.close()
}
await b.close()
