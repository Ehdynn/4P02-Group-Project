import useUser from "../context/useUser"

const Landing = () => {
  const {isProfessor, roleReady } = useUser();
  return (<p>{isProfessor ? "Prof": "not prof"}</p>)

}

export default Landing