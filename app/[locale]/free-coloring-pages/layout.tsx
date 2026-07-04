export default function FreeColoringPagesLayout({
    children,
    modal,
  }: {
    children: React.ReactNode;
    modal: React.ReactNode;
  }) {
    return (
      <>
        {children}
        {modal}
      </>
    );
  }
  