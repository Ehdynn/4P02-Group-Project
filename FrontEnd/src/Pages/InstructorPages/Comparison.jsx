import { useParams } from "react-router-dom"

const Comparison = () => {
  const {aid} = useParams();
  return (
    <div>Comparison Placeholder Viewing {aid}</div>
  )
}

export default Comparison