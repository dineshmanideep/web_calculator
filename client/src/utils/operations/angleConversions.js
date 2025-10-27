import { toast } from 'react-toastify';

export const angleConversions = {
  // Angle conversions
  deg2rad: (deg) => {
    try {
      if (typeof deg !== 'number' && isNaN(Number(deg))) {
        toast.error('deg2rad: Input must be a number');
        throw new Error('Invalid input to deg2rad');
      }
      return typeof deg === 'number' ? deg * Math.PI / 180 : math.evaluate(`${deg} * pi / 180`);
    } catch (error) {
      toast.error('Degree to radian conversion failed');
      throw error;
    }
  },

  rad2deg: (rad) => {
    try {
      if (typeof rad !== 'number' && isNaN(Number(rad))) {
        toast.error('rad2deg: Input must be a number');
        throw new Error('Invalid input to rad2deg');
      }
      return typeof rad === 'number' ? rad * 180 / Math.PI : math.evaluate(`${rad} * 180 / pi`);
    } catch (error) {
      toast.error('Radian to degree conversion failed');
      throw error;
    }
  },
};
