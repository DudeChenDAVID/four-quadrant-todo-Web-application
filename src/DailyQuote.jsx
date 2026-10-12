import React, { useEffect, useState } from 'react'

const quotes = [
  ['知者不惑，仁者不忧，勇者不惧。', '《论语·子罕》'],
  ['不积跬步，无以至千里；不积小流，无以成江海。', '荀子《劝学》'],
  ['行到水穷处，坐看云起时。', '王维《终南别业》'],
  ['知人者智，自知者明。', '《道德经》第三十三章'],
  ['千里之行，始于足下。', '《道德经》第六十四章'],
  ['山重水复疑无路，柳暗花明又一村。', '陆游《游山西村》'],
  ['纸上得来终觉浅，绝知此事要躬行。', '陆游《冬夜读书示子聿》'],
  ['不以物喜，不以己悲。', '范仲淹《岳阳楼记》'],
  ['博学之，审问之，慎思之，明辨之，笃行之。', '《礼记·中庸》'],
  ['横看成岭侧成峰，远近高低各不同。', '苏轼《题西林壁》'],
  ['吾生也有涯，而知也无涯。', '《庄子·养生主》'],
  ['莫听穿林打叶声，何妨吟啸且徐行。', '苏轼《定风波·莫听穿林打叶声》'],
  ['问渠那得清如许？为有源头活水来。', '朱熹《观书有感·其一》'],
  ['天行健，君子以自强不息。', '《周易·乾·象传》'],
]

export const quoteDay = () => {
  const now = new Date()
  return Math.floor(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()) / 86400000)
}

export default function DailyQuote() {
  const [day, setDay] = useState(quoteDay)
  useEffect(() => {
    const refresh = () => setDay(quoteDay())
    const timer = setInterval(refresh, 1000)
    window.addEventListener('focus', refresh)
    return () => { clearInterval(timer); window.removeEventListener('focus', refresh) }
  }, [])
  const [text, source] = quotes[day % quotes.length]
  return <aside className="daily-quote" aria-label="每日哲思">
    <span className="quote-label">每日哲思</span>
    <blockquote><p>{text}</p><cite>— {source}</cite></blockquote>
  </aside>
}
