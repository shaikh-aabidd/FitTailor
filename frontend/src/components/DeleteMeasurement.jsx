import { useNavigate } from "react-router-dom";
import { useDeleteMeasurementMutation } from "../features/api/measurement.api";
import { toast } from "react-toastify";

const DeleteMeasurementButton = ({ id }) => {
    const navigate = useNavigate();
    const [deleteMeasurement, { isLoading }] = useDeleteMeasurementMutation();
  
    const handleDelete = async () => {
      const confirmed = window.confirm('Are you sure you want to delete this measurement?');
      if (!confirmed) return;
  
      try {
        await deleteMeasurement(id).unwrap();
        toast.success('Measurement deleted!');
        navigate('/profile');
      } catch (err) {
        toast.error(err?.data?.message || 'Failed to delete measurement');
      }
    };
  
    return (
      <button
        onClick={handleDelete}
        disabled={isLoading}
        className="text-red-500 border border-red-500 px-3 py-1 rounded hover:bg-red-50 transition text-sm"
      >
        {isLoading ? 'Deleting...' : 'Delete'}
      </button>
    );
  };

export default DeleteMeasurementButton;