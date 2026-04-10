import { Navbar } from '@/components/layout/Navbar';
import { BottomNav } from '@/components/layout/BottomNav';
import { MobileHeader } from '@/components/layout/MobileHeader';
import { ActiveWorkoutBar } from '@/components/layout/ActiveWorkoutBar';

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Navbar />
      <MobileHeader />
      <main className="flex-1 pb-20 md:pb-0">{children}</main>
      <ActiveWorkoutBar />
      <BottomNav />
    </>
  );
}
