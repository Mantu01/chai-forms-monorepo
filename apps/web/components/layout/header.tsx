import Link from "next/link"
import Logo from "./logo"

const navLinks = [
  { href: "/about", label: "About" },
  { href: "/terms", label: "Terms" },
  { href: "/privacy-policy", label: "Privacy" },
]

export default function Header() {
  return (
    <header className="fixed top-0 z-50 w-full border-b border-border bg-background/70 backdrop-blur-xl supports-backdrop-filter:bg-background/60">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-3 group">
          <Logo />
          <span
            className="text-lg font-bold tracking-tight transition-colors group-hover:text-primary"
            style={{ fontFamily: "'Syne', sans-serif" }}
          >
            Chai Form
          </span>
        </Link>

        <nav className="hidden sm:flex items-center gap-8">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  )
}