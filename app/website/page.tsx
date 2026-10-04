import Link from "next/link"

const heroImage = "/images/sheba-dashboard-reference.jpg"

export default function ShebaWebsite() {
  return (
    <main className="min-h-screen bg-[#fbfdff] text-[#172033]">
      <header className="border-b border-[#e7f2f8] bg-white/95">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-5 lg:px-8">
          <Link href="/website" className="text-3xl font-semibold tracking-tight text-[#36ace7]">সেবা<span className="text-[#8fd5f5]">☁</span></Link>
          <nav className="hidden items-center gap-8 text-sm text-[#536275] md:flex">
            <Link href="/website#about">আমাদের কথা</Link><Link href="/website#services">সেবা</Link><Link href="/website/blog">ব্লগ</Link>
          </nav>
          <Link href="/login" className="rounded-full bg-[#36ace7] px-5 py-2.5 text-sm font-medium text-white">অ্যাপে প্রবেশ</Link>
        </div>
      </header>
      <section className="mx-auto grid max-w-6xl items-center gap-10 px-5 py-16 lg:grid-cols-[1.05fr_.95fr] lg:px-8 lg:py-24">
        <div><p className="mb-5 text-sm font-semibold uppercase tracking-[.24em] text-[#36ace7]">সহজ জীবন, এক জায়গায়</p><h1 className="max-w-xl text-balance text-5xl font-semibold leading-[1.08] tracking-tight sm:text-6xl">আপনার প্রতিদিনের <span className="text-[#36ace7]">ডিজিটাল সঙ্গী</span></h1><p className="mt-6 max-w-lg text-lg leading-8 text-[#6b7788]">সেবা দিয়ে টাকা পাঠান, রিচার্জ করুন, বিল পরিশোধ করুন এবং আপনার দৈনন্দিন আর্থিক কাজ সহজে পরিচালনা করুন।</p><div className="mt-8 flex flex-wrap gap-3"><Link href="/login" className="rounded-full bg-[#36ace7] px-6 py-3.5 font-medium text-white">সেবা ব্যবহার করুন</Link><Link href="/website/blog" className="rounded-full border border-[#bde6f8] bg-white px-6 py-3.5 font-medium text-[#238fc9]">আমাদের ব্লগ পড়ুন</Link></div></div>
        <div className="overflow-hidden rounded-[2rem] border border-[#d9effa] bg-[#eaf8fe] shadow-[0_20px_60px_rgba(54,172,231,.15)]"><img src={heroImage} alt="সেবা ব্যবহার করে মানুষের জীবন সহজ হচ্ছে" className="h-[300px] w-full object-cover sm:h-[390px]" /></div>
      </section>
      <section id="services" className="border-y border-[#e7f2f8] bg-white"><div className="mx-auto grid max-w-6xl gap-5 px-5 py-14 sm:grid-cols-3 lg:px-8"><Feature title="টাকা পাঠান" text="নিরাপদে প্রিয়জনের কাছে টাকা পাঠান।" /><Feature title="বিল ও রিচার্জ" text="সময় বাঁচিয়ে প্রয়োজনীয় পেমেন্ট করুন।" /><Feature title="আপনার নিয়ন্ত্রণে" text="লেনদেন, বাজেট ও সঞ্চয় এক জায়গায়।" /></div></section>
      <section id="about" className="mx-auto max-w-6xl px-5 py-16 lg:px-8"><p className="max-w-2xl text-xl leading-9 text-[#536275]">সেবা তৈরি হয়েছে বাংলাদেশের মানুষের দৈনন্দিন আর্থিক জীবনকে আরও সহজ, দ্রুত এবং নিরাপদ করার জন্য।</p></section>
      <footer className="border-t border-[#e7f2f8] bg-white"><div className="mx-auto flex max-w-6xl flex-col gap-3 px-5 py-8 text-sm text-[#7a8795] sm:flex-row sm:items-center sm:justify-between lg:px-8"><span>© 2026 Sheba</span><Link href="/website/blog" className="text-[#238fc9]">সেবা ব্লগ</Link></div></footer>
    </main>
  )
}

function Feature({ title, text }: { title: string; text: string }) { return <article className="rounded-2xl border border-[#e3f2f9] bg-[#fbfdff] p-6"><h2 className="text-xl font-semibold text-[#172033]">{title}</h2><p className="mt-2 leading-7 text-[#6b7788]">{text}</p></article> }
