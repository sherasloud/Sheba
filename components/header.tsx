export function Header() {
  return (
    <header className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-3">
            <Image src="/images/app-logo.png" alt="Sheba Logo" width={40} height={40} className="rounded-lg" />
            <h1 className="text-2xl font-bold text-blue-600">Sheba</h1>
          </div>
          {/* Added missing closing tag */}
        </div>
      </div>
    </header>
  )
}
