import { chromium } from 'playwright'
const dir='/private/tmp/claude-501/-Users-asifh-Desktop-NewFolderr/fc65be52-d920-4f70-a610-eda54c62a119/scratchpad'
const b=await chromium.launch()
for (const [tag,w,h] of [['desk',1440,900],['mob',390,844]]) {
  const p=await b.newPage({viewport:{width:w,height:h}})
  const errs=[]; p.on('pageerror',e=>errs.push(String(e)))
  await p.goto('http://localhost:5629/public',{waitUntil:'networkidle'})
  await p.waitForTimeout(2600)
  const m=await p.evaluate(()=>{
    const c=document.querySelector('.ps-scroll').getBoundingClientRect()
    const hm=document.querySelector('.hm').getBoundingClientRect()
    const prom=document.querySelector('#promise').getBoundingClientRect()
    const bk=[...document.querySelectorAll('a')].find(a=>/Book an Event|ಬುಕ್/.test(a.innerText))?.getBoundingClientRect()
    return {
      cueCentreOffset: Math.round((c.left+c.right)/2 - window.innerWidth/2),
      cueBottom: Math.round(window.innerHeight - c.bottom),
      marqueeH: Math.round(hm.height),
      cueOverlapsMarquee: c.bottom > hm.top + 2,
      cueOverlapsBook: bk ? !(c.right<bk.left||c.left>bk.right||c.bottom<bk.top||c.top>bk.bottom) : null,
      promiseHidden: prom.top >= window.innerHeight - 20,
      items: document.querySelectorAll('.hm-item').length,
    }
  })
  console.log(tag,JSON.stringify(m))
  if(errs.length) console.log('  errors:',errs.slice(0,1))
  await p.screenshot({path:`${dir}/hm-${tag}.png`})
  await p.close()
}
await b.close()
