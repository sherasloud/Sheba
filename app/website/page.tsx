import Link from "next/link"

const heroImage = "https://i.postimg.cc/0NLNqDL9/Unknown-57.jpg"

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
        <div className="overflow-hidden rounded-[2rem] border border-[#d9effa] bg-white shadow-[0_20px_60px_rgba(54,172,231,.15)]"><img src={heroImage} alt="Sheba mobile app dashboard" className="block h-auto max-h-[720px] w-full object-contain" /></div>
      </section>
      <section className="border-y border-[#e7f2f8] bg-white"><div className="mx-auto grid max-w-6xl gap-8 px-5 py-12 sm:grid-cols-3 lg:px-8"><Stat value="এক অ্যাপ" label="প্রতিদিনের প্রয়োজন" /><Stat value="নিরাপদ" label="আপনার লেনদেন" /><Stat value="সহজ" label="সবার জন্য ডিজিটাল সেবা" /></div></section>
      <section id="services" className="mx-auto max-w-6xl px-5 py-20 lg:px-8"><div className="max-w-2xl"><p className="text-sm font-semibold uppercase tracking-[.2em] text-[#36ace7]">যা যা করতে পারবেন</p><h2 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">আপনার প্রয়োজনীয় সেবা, এক জায়গায়</h2><p className="mt-4 text-lg leading-8 text-[#6b7788]">সেবা অ্যাপ আপনাকে প্রতিদিনের টাকা পাঠানো, পেমেন্ট এবং পরিকল্পনার কাজগুলো দ্রুত ও স্বচ্ছভাবে করতে সাহায্য করে।</p></div><div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3"><Feature title="টাকা পাঠান" text="নিরাপদে প্রিয়জন, পরিবার বা পরিচিত মানুষের কাছে টাকা পাঠান।" /><Feature title="মোবাইল রিচার্জ" text="যেকোনো সময় মোবাইল রিচার্জ করে সংযোগ সচল রাখুন।" /><Feature title="বিল পরিশোধ" text="গুরুত্বপূর্ণ বিল ও নিয়মিত পেমেন্ট সময়মতো সম্পন্ন করুন।" /><Feature title="ক্যাশআউট" text="প্রয়োজনের সময় আপনার অর্থ সহজে ব্যবহারের ব্যবস্থা করুন।" /><Feature title="বাজেট ও সঞ্চয়" text="আপনার খরচ, বাজেট ও সঞ্চয়ের পরিকল্পনা নিজের নিয়ন্ত্রণে রাখুন।" /><Feature title="এডু ফি ও টিকিট" text="শিক্ষা ফি এবং ভ্রমণের প্রয়োজনীয় পেমেন্ট এক জায়গা থেকে করুন।" /></div></section>
      <section id="about" className="bg-[#effaff]"><div className="mx-auto grid max-w-6xl gap-10 px-5 py-20 lg:grid-cols-2 lg:items-center lg:px-8"><div><p className="text-sm font-semibold uppercase tracking-[.2em] text-[#36ace7]">সেবা সম্পর্কে</p><h2 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">ডিজিটাল জীবনকে করি আরও স্বচ্ছন্দ</h2></div><div className="space-y-5 text-lg leading-8 text-[#536275]"><p>সেবা তৈরি হয়েছে বাংলাদেশের মানুষের দৈনন্দিন আর্থিক জীবনকে আরও সহজ, দ্রুত এবং নিরাপদ করার জন্য। একটি পরিষ্কার অভিজ্ঞতার মাধ্যমে প্রয়োজনীয় কাজগুলো এক জায়গায় সাজানোই আমাদের লক্ষ্য।</p><p>আপনি টাকা পাঠান, রিচার্জ করুন, বিল দিন কিংবা নিজের বাজেট দেখুন—সেবা আপনাকে প্রতিটি ধাপে সহজ নিয়ন্ত্রণ দেয়।</p></div></div></section>
      <section className="mx-auto max-w-6xl px-5 py-20 lg:px-8"><div className="rounded-[2rem] bg-[#36ace7] px-6 py-12 text-center text-white sm:px-12"><h2 className="text-3xl font-semibold sm:text-4xl">আপনার ডিজিটাল যাত্রা শুরু করুন</h2><p className="mx-auto mt-4 max-w-2xl text-lg leading-8 text-white/90">সেবা অ্যাপে প্রবেশ করে আপনার প্রতিদিনের আর্থিক কাজগুলো আরও সহজভাবে পরিচালনা করুন।</p><Link href="/login" className="mt-8 inline-flex rounded-full bg-white px-7 py-3.5 font-medium text-[#238fc9]">অ্যাপে প্রবেশ করুন</Link></div></section>
      <footer className="border-t border-[#e7f2f8] bg-white"><div className="mx-auto flex max-w-6xl flex-col gap-3 px-5 py-8 text-sm text-[#7a8795] sm:flex-row sm:items-center sm:justify-between lg:px-8"><span>© 2026 Sheba</span><Link href="/website/blog" className="text-[#238fc9]">সেবা ব্লগ</Link></div></footer>
    </main>
  )
}

function Feature({ title, text }: { title: string; text: string }) { return <article className="rounded-2xl border border-[#e3f2f9] bg-[#fbfdff] p-6"><h2 className="text-xl font-semibold text-[#172033]">{title}</h2><p className="mt-2 leading-7 text-[#6b7788]">{text}</p></article> }

function Stat({ value, label }: { value: string; label: string }) { return <div className="text-center sm:text-left"><p className="text-2xl font-semibold text-[#36ace7]">{value}</p><p className="mt-1 text-[#6b7788]">{label}</p></div> }
