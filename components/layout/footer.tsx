import { Container } from "./container";

const YEAR = new Date().getFullYear();

/** 정적 푸터 컴포넌트 */
export function Footer() {
  return (
    <footer className="border-t py-6">
      <Container>
        <p className="text-center text-sm text-muted-foreground">
          © {YEAR} 모이다
        </p>
      </Container>
    </footer>
  );
}
