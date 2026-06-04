const getDashboard = async (req, res) => {
  try {
    res.status(200).json({
      providerName: "Ali Raza",
      providerInitials: "AR",
      isCnicVerified: true,

      totalJobs: 15,
      pendingJobs: 3,
      doneJobs: 12,
      earned: 25000,

      commissionModel: {
        freeJobsCount: 5,
        commissionRate: 10,
      },

      incomingRequests: [
        {
          jobId: "101",
          customerName: "Ahmed",
          scheduledDate: "2026-06-03",
          scheduledTime: "10:00 AM",
          location: "Lahore",
          amount: 1500,
          status: "Pending",
        },
      ],
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

const acceptJob = async (req, res) => {
  try {
    const { jobId } = req.params;

    res.status(200).json({
      success: true,
      message: `Job ${jobId} accepted`,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

const rejectJob = async (req, res) => {
  try {
    const { jobId } = req.params;

    res.status(200).json({
      success: true,
      message: `Job ${jobId} rejected`,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

const getCommission = async (req, res) => {
  try {
    res.status(200).json({
      freeJobsCount: 5,
      commissionRate: 10,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

module.exports = {
  getDashboard,
  acceptJob,
  rejectJob,
  getCommission,
};