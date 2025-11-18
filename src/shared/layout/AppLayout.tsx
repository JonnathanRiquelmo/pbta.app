import { Header } from '../components/Header'

export function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="app">
      <Header />
      <main className="container">{children}</main>
    </div>
  )
}