import { chromium } from 'playwright'
const dir='/private/tmp/claude-501/-Users-asifh-Desktop-NewFolderr/fc65be52-d920-4f70-a610-eda54c62a119/scratchpad'
const b=await chromium.launch()
const p=await b.newPage({viewport:{width:1440,height:1000}})
const errs=[]; p.on('pageerror',e=>errs.push(String(e)))
await p.goto('http://localhost:5625/public',{waitUntil:'networkidle'})
await p.waitForTimeout(2600)
// switch to Kannada
await p.locator('.ps-nav button', {hasText:'ಕನ್ನಡ'}).first().click()
await p.waitForTimeout(1500)
const m=await p.evaluate(()=>{
  const eb=document.querySelector('.ps-eyebrow'), ti=document.querySelector('.ps-title')
  const shell=document.querySelector('#top')
  return {
    lang: shell?.getAttribute('data-lang'),
    eyebrowLS: getComputedStyle(eb).letterSpacing,
    eyebrowFont: getComputedStyle(eb).fontFamily.split(',')[0],
    titleFont: getComputedStyle(ti).fontFamily.split(',')[0],
    has2013: document.body.innerText.includes('2013') || document.body.innerText.includes('೨೦೧೩'),
    ov: document.documentElement.scrollWidth>window.innerWidth+1,
  }
})
console.log('KANNADA:',JSON.stringify(m,null,1))
console.log('errors:',errs.length?errs.slice(0,2):'none')
await p.screenshot({path:`${dir}/kn-hero.png`})
// back to English to confirm nothing regressed
await p.locator('.ps-nav button', {hasText:'English'}).first().click()
await p.waitForTimeout(1200)
const en=await p.evaluate(()=>{
  const eb=document.querySelector('.ps-eyebrow')
  return {lang:document.querySelector('#top')?.getAttribute('data-lang'),
    eyebrowLS:getComputedStyle(eb).letterSpacing,
    titleFont:getComputedStyle(document.querySelector('.ps-title')).fontFamily.split(',')[0]}
})
console.log('ENGLISH:',JSON.stringify(en))
await p.screenshot({path:`${dir}/en-hero.png`})
await b.close()
