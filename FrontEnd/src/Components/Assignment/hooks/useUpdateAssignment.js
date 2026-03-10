import { useCallback, useState } from "react";
import toTimestamptzIso from "../../../utils/Timestamp/toTimestamptzIso";
import { updateAssignment } from "../../../utils/DatabaseInteractions/Instructor/updateAssignment";

export function useUpdateAssignment(aid, formData, setFormData, setDetails){
    
    const [submitted, setSubmitted] = useState(false);
    const [loadingUpdate, setLoadingUpdate] = useState(false);
    const [updateError, setUpdateError] = useState("");

    const onChange = (event) => {
        const { name, value } = event.target;
        setFormData((previous) => ({ ...previous, [name]: value }));
        setUpdateError("");
        setSubmitted(false);
    };

    const handleSubmit = useCallback( 
        async (event) => {
            event.preventDefault();
            setSubmitted(false);
            const {dueDate, description } = formData;

            if (!formData.name.trim()) {
            setUpdateError("Name field can not be blank.");
            return;
            }

            setLoadingUpdate(true);
            setUpdateError("");

            const dueDateWithTimezone = toTimestamptzIso(dueDate);

            if (dueDate && !dueDateWithTimezone) {
            setLoadingUpdate(false);
            setUpdateError("Invalid due date format.");
            return;
            }

            let assignmentData = null;
            try {
            assignmentData = await updateAssignment(aid, formData.name, dueDateWithTimezone, description);
            } catch (invokeError) {
            let errorMessage = invokeError instanceof Error ? invokeError.message : "Unable to create assignment";
            if (invokeError?.context) {
                try {
                const payload = await invokeError.context.json();
                errorMessage = payload?.error || errorMessage;
                } catch {
                // Keep default message if response is not JSON.
                }
            }
            setUpdateError(errorMessage);
            setSubmitted(false);
            setLoadingUpdate(false);
            return;
            }

            setLoadingUpdate(false);
            setSubmitted(true);
            setDetails(assignmentData)
        },[formData]
    );

    return{
        handleSubmit,
        submitted,
        loadingUpdate,
        onChange,
        updateError,
    };
}