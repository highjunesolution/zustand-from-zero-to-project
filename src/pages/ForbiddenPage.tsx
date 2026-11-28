import { Link } from "react-router";

const ForbiddenPage = () => {
  return (
    <main>
        <h1>403 Forbidden</h1>

        <p>
            You do not have permission to access this page
        </p>

        <Link to={"/dashboard"}>
            Back to Dashboard
        </Link>
    </main>
  )
}
export default ForbiddenPage