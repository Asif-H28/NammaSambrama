import { chromium } from 'playwright'
const dir='/private/tmp/claude-501/-Users-asifh-Desktop-NewFolderr/fc65be52-d920-4f70-a610-eda54c62a119/scratchpad'
const b=await chromium.launch()
for (const [tag,w,h] of [['desk',1440,900],['tall',1440,1200],['mob',390,844],['short',1280,600]]) {
  const p=await b.newPage({viewport:{width:w,height:h}})
  const errs=[]; p.on('pageerror',e=>errs.push(String(e)))
  await p.goto('http://localhost:5627/public',{waitUntil:'networkidle'})
  await p.waitForTimeout(2500)
  const m=await p.evaluate(()=>{
    const hero=document.querySelector('.ps-hero').getBoundingClientRect()
    const prom=document.querySelector('#promise').getBoundingClientRect()
    return {vh:window.innerHeight, heroH:Math.round(hero.height),
      promiseTop:Math.round(prom.top),
      promiseVisibleOnFirstScreen: prom.top < window.innerHeight - 20,
      cue:!!document.querySelector('.ps-scroll')}
  })
  console.log(tag.padEnd(6),`vp=${w}x${h}`,JSON.stringify(m))
  if(errs.length) console.log('   errors:',errs.slice(0,1))
  await p.screenshot({path:`${dir}/hf-${tag}.png`})
  await p.close()
}
await b.close()
