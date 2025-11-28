import Header from "@/components/Header";
import Hero from "@/components/Hero";
import { ManuscriptList } from "@/components/ManuscriptList";
import { Container } from "@/components/ui/container";

const Index = () => {
  return (
    <div className="min-h-screen bg-background font-inter">
      <Header />
      <main>
        <Hero />
        <Container className="py-16">
          <ManuscriptList />
        </Container>
      </main>
    </div>
  );
};

export default Index;
