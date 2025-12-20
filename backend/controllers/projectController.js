const Project = require('../models/Project');
const { deleteFromCloudinary } = require('../middleware/upload');

// @desc    Get all active projects with pagination, filtering, and search
// @route   GET /api/projects
// @access  Public
exports.getAllProjects = async (req, res) => {
  try {
    // Pagination
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 12;
    const skip = (page - 1) * limit;

    // Build query
    let query = { isActive: true };

    // Category filter
    if (req.query.category) {
      query.category = req.query.category;
    }

    // Search functionality (search in title, description, technologies)
    if (req.query.search) {
      const searchRegex = new RegExp(req.query.search, 'i');
      query.$or = [
        { title: searchRegex },
        { description: searchRegex },
        { technologies: searchRegex }
      ];
    }

    // Price range filter (optional)
    if (req.query.minPrice || req.query.maxPrice) {
      query.price = {};
      if (req.query.minPrice) {
        query.price.$gte = parseFloat(req.query.minPrice);
      }
      if (req.query.maxPrice) {
        query.price.$lte = parseFloat(req.query.maxPrice);
      }
    }

    // Sort options
    let sortOption = { createdAt: -1 }; // Default: newest first
    if (req.query.sort) {
      switch (req.query.sort) {
        case 'price-asc':
          sortOption = { price: 1 };
          break;
        case 'price-desc':
          sortOption = { price: -1 };
          break;
        case 'title-asc':
          sortOption = { title: 1 };
          break;
        case 'title-desc':
          sortOption = { title: -1 };
          break;
        case 'oldest':
          sortOption = { createdAt: 1 };
          break;
        default:
          sortOption = { createdAt: -1 };
      }
    }

    // Execute query
    const projects = await Project.find(query)
      .populate('category', 'name slug')
      .sort(sortOption)
      .skip(skip)
      .limit(limit)
      .select('-__v');

    // Get total count for pagination
    const totalProjects = await Project.countDocuments(query);
    const totalPages = Math.ceil(totalProjects / limit);

    res.status(200).json({
      success: true,
      count: projects.length,
      pagination: {
        currentPage: page,
        totalPages,
        totalProjects,
        limit,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1
      },
      data: projects
    });

  } catch (error) {
    console.error('Get projects error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching projects',
      error: error.message
    });
  }
};

// @desc    Get single project by ID
// @route   GET /api/projects/:id
// @access  Public
exports.getProjectById = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate('category', 'name slug description');

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    // Only return active projects to public
    if (!project.isActive) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    res.status(200).json({
      success: true,
      data: project
    });

  } catch (error) {
    console.error('Get project error:', error);

    // Handle invalid ObjectId
    if (error.kind === 'ObjectId') {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Error fetching project',
      error: error.message
    });
  }
};

// @desc    Create new project
// @route   POST /api/projects
// @access  Private/Admin
exports.createProject = async (req, res) => {
  try {
    // Handle uploaded images
    const projectData = { ...req.body };

    // If images were uploaded via multer to Cloudinary
    if (req.files && req.files.length > 0) {
      projectData.images = req.files.map(file => file.path); // Cloudinary URL
    } else if (req.body.images) {
      // If images are provided as URLs in the request body
      projectData.images = Array.isArray(req.body.images)
        ? req.body.images
        : [req.body.images];
    }

    // Parse arrays if they come as strings (from form-data)
    if (typeof projectData.technologies === 'string') {
      projectData.technologies = JSON.parse(projectData.technologies);
    }
    if (typeof projectData.features === 'string') {
      projectData.features = JSON.parse(projectData.features);
    }

    // Validate required fields
    if (!projectData.title || !projectData.description || !projectData.category || !projectData.price) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields: title, description, category, price'
      });
    }

    const project = await Project.create(projectData);

    res.status(201).json({
      success: true,
      message: 'Project created successfully',
      data: project
    });

  } catch (error) {
    console.error('Create project error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating project',
      error: error.message
    });
  }
};

// @desc    Update project
// @route   PUT /api/projects/:id
// @access  Private/Admin
exports.updateProject = async (req, res) => {
  try {
    // Find existing project first to get old images
    const existingProject = await Project.findById(req.params.id);

    if (!existingProject) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    // Handle uploaded images
    const updateData = { ...req.body };
    let newImages = [];

    // If new images were uploaded via multer to Cloudinary
    if (req.files && req.files.length > 0) {
      newImages = req.files.map(file => file.path); // Cloudinary URL
      updateData.images = newImages;
    } else if (req.body.images) {
      // If images are provided as URLs in the request body
      newImages = Array.isArray(req.body.images)
        ? req.body.images
        : [req.body.images];
      updateData.images = newImages;
    }

    // If images are being updated, delete removed ones from Cloudinary
    if (newImages.length > 0) {
      const oldImages = existingProject.images || [];
      const imagesToDelete = oldImages.filter(img => !newImages.includes(img));

      for (const imageUrl of imagesToDelete) {
        await deleteFromCloudinary(imageUrl);
      }
    }

    // Parse arrays if they come as strings (from form-data)
    if (typeof updateData.technologies === 'string') {
      updateData.technologies = JSON.parse(updateData.technologies);
    }
    if (typeof updateData.features === 'string') {
      updateData.features = JSON.parse(updateData.features);
    }

    const project = await Project.findByIdAndUpdate(
      req.params.id,
      updateData,
      {
        new: true,
        runValidators: true
      }
    );

    res.status(200).json({
      success: true,
      message: 'Project updated successfully',
      data: project
    });

  } catch (error) {
    console.error('Update project error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating project',
      error: error.message
    });
  }
};

// @desc    Delete project
// @route   DELETE /api/projects/:id
// @access  Private/Admin
exports.deleteProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    // Delete images from Cloudinary
    if (project.images && project.images.length > 0) {
      for (const imageUrl of project.images) {
        await deleteFromCloudinary(imageUrl);
      }
    }

    await Project.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Project deleted successfully'
    });

  } catch (error) {
    console.error('Delete project error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting project',
      error: error.message
    });
  }
};
