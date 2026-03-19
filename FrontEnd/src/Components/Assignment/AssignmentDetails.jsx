const AssignmentDetails = ({details}) => {

  return (
    <>
    <h1 className="h1-default text-center">{details.name ?? "Assignment"}</h1>
    <p className="">Due on {details.due_date ? (new Date(details.due_date).toLocaleString('en-US', {dateStyle: "medium"}) + " " + new Date(details.due_date).toLocaleString('en-US', { hour: 'numeric', minute: 'numeric', hour12: true })) : "No Due Date Provided"}</p>
    <h2 >Submission Code: {details.key}</h2>
    <div className="box-wrapper-square">
        <h2 className="h2-large text-center">Description</h2>
        <hr className="h-px my-8 bg-neutral-quaternary border-sm border-gray-500"/>
        <p>{details.description ?? "No description provided."}</p>
    </div>
    
    </>
  )
}

export default AssignmentDetails