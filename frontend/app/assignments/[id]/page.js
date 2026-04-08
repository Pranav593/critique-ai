export default async function AssignmentPage({ params }) {
  const { id } = await params;

  return <h1>Assignment ID: {id}</h1>;
}