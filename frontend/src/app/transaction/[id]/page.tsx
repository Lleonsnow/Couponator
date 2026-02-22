export default async function TransactionPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return (
    <div className="mx-auto max-w-[var(--container)] px-5 py-6">
      <p>Результат транзакции {id}</p>
    </div>
  );
}
