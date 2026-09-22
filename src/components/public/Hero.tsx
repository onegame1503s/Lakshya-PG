import Link from "next/link";

// 👇 SWAP THIS URL WHEN THE OWNER PROVIDES THE REAL FRONT ELEVATION OR MAIN ROOM PHOTO
const HERO_IMAGE = "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?q=80&w=2071&auto=format&fit=crop";

export default function Hero() {
  return (
    <section className="relative w-full h-[85vh] flex items-center justify-center">
      <div 
        className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url('${HERO_IMAGE}')` }}
      >
        <div className="absolute inset-0 bg-zinc-950/60 bg-gradient-to-t from-zinc-950/90 to-transparent"></div>
      </div>

      <div className="relative z-10 w-full max-w-7xl mx-auto px-6 mt-16">
        <div className="max-w-2xl bg-white/5 backdrop-blur-md border border-white/10 p-8 md:p-12 rounded-3xl shadow-2xl">
          <div className="inline-block px-4 py-1.5 mb-6 rounded-full border border-zinc-400/50 bg-zinc-500/20 text-zinc-100 text-[10px] font-bold tracking-widest uppercase">
            Lakshya PG Admissions Open
          </div>
          <h1 className="text-4xl md:text-6xl font-light text-white tracking-tighter leading-tight mb-6">
            Elevate Your <br />
            <span className="font-bold">Living Standard.</span>
          </h1>
          <p className="text-lg md:text-xl text-zinc-300 mb-10 leading-relaxed font-light">
            Premium, secure, and fully-managed PG accommodations designed specifically for focused coaching students. Experience zero compromises on your journey to success.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Link href="/rooms" className="flex items-center justify-center px-8 py-4 bg-white text-zinc-950 font-bold tracking-wide rounded-lg hover:bg-zinc-200 transition-colors shadow-lg">
              View Pricing & Rooms
            </Link>
            <Link href="/apply" className="flex items-center justify-center px-8 py-4 bg-transparent text-white border border-white/30 font-semibold rounded-lg hover:bg-white/10 transition-colors">
              Apply for Admission
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}