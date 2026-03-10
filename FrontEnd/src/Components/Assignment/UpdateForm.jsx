import React from 'react'

const UpdateForm = ({handleSubmit, formData, onChange, updateError, submitted, loadingUpdate}) => {
  return (
    <>
    <h1 className="h1-default text-center">Update</h1>
        <form onSubmit={handleSubmit} className="form-default">
          <label className="label-default">
            <span className="span-default">Assignment Name</span>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={onChange}
              placeholder="Assignment One"
              className="field-default"
            />
          </label>

            <label className="label-default">
              <span className="span-default">Due Date</span>
              <input
                type="datetime-local"
                name="dueDate"
                value={formData.dueDate}
                onChange={onChange}
                className="field-default"
              />
            </label>

            <label className="label-default">
              <span className="span-default">Description</span>
              <textarea
                  name="description"
                  value={formData.description}
                  onChange={(e) => {
                      onChange(e);
                      e.target.style.height = "auto";
                      e.target.style.height = e.target.scrollHeight + "px";
                  }}
                  rows={1}
                  className="field-default overflow-hidden resize-none"
              />
            </label>

          {updateError ? <p className="error">{updateError}</p> : null}
          {submitted ? <p className="success">Assignment Updated!</p> : null}

          <button
            type="submit"
            disabled={loadingUpdate}
            className="submit-button"
          >
            {loadingUpdate ? "Updating..." : "Update Assignment"}
          </button>     
      </form>
    </>
  )
}

export default UpdateForm