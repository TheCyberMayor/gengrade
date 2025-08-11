// Feedback Management System for IntellGrade

class FeedbackManager {
    constructor() {
        this.feedbackData = this.loadFeedbackData();
        this.init();
    }

    init() {
        // Initialize feedback system
        this.setupEventListeners();
    }

    setupEventListeners() {
        // Rating stars functionality
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('rating-star') || e.target.closest('.rating-star')) {
                const starContainer = e.target.closest('.rating-container');
                const clickedStar = e.target.closest('.rating-star');
                
                if (clickedStar && starContainer) {
                    const rating = parseInt(clickedStar.dataset.rating);
                    this.setRating(starContainer, rating);
                }
            }
        });

        // Hover effects for rating stars
        document.addEventListener('mouseover', (e) => {
            if (e.target.classList.contains('rating-star')) {
                const starContainer = e.target.closest('.rating-container');
                const hoveredStar = e.target;
                const rating = parseInt(hoveredStar.dataset.rating);
                this.showHoverRating(starContainer, rating);
            }
        });

        document.addEventListener('mouseout', (e) => {
            if (e.target.classList.contains('rating-star')) {
                const starContainer = e.target.closest('.rating-container');
                this.resetHoverRating(starContainer);
            }
        });
    }

    setRating(container, rating) {
        const stars = container.querySelectorAll('.rating-star');
        const hiddenInput = container.querySelector('.rating-value');
        
        stars.forEach((star, index) => {
            if (index < rating) {
                star.classList.remove('far');
                star.classList.add('fas', 'text-warning');
            } else {
                star.classList.remove('fas', 'text-warning');
                star.classList.add('far');
            }
        });
        
        if (hiddenInput) {
            hiddenInput.value = rating;
        }
    }

    showHoverRating(container, rating) {
        const stars = container.querySelectorAll('.rating-star');
        stars.forEach((star, index) => {
            if (index < rating) {
                star.classList.add('text-warning');
            }
        });
    }

    resetHoverRating(container) {
        const stars = container.querySelectorAll('.rating-star');
        const currentRating = parseInt(container.querySelector('.rating-value')?.value || 0);
        
        stars.forEach((star, index) => {
            if (index >= currentRating) {
                star.classList.remove('text-warning');
            }
        });
    }

    loadFeedbackData() {
        const stored = localStorage.getItem('intellgrade_feedback');
        if (stored) {
            return JSON.parse(stored);
        }
        
                       // Initialize with sample data
               return {
                   feedbacks: [
                       {
                           id: 'FB_1703123456789_abc123',
                           courseCode: 'CSC101',
                           courseTitle: 'Introduction to Computer Science',
                           lecturerId: 'LEC001',
                           lecturerName: 'Dr. John Smith',
                           rating: 5,
                           comment: 'Excellent teaching methods and clear explanations. The practical sessions were very helpful and I learned a lot.',
                           submittedAt: '2024-01-15T10:30:00.000Z',
                           semester: '2024/1',
                           anonymous: true
                       },
                       {
                           id: 'FB_1703123456790_def456',
                           courseCode: 'CSC101',
                           courseTitle: 'Introduction to Computer Science',
                           lecturerId: 'LEC001',
                           lecturerName: 'Dr. John Smith',
                           rating: 4,
                           comment: 'Great course content and teaching methods. The instructor is very knowledgeable and helpful.',
                           submittedAt: '2024-01-14T14:20:00.000Z',
                           semester: '2024/1',
                           anonymous: true
                       },
                       {
                           id: 'FB_1703123456791_ghi789',
                           courseCode: 'CSC101',
                           courseTitle: 'Introduction to Computer Science',
                           lecturerId: 'LEC001',
                           lecturerName: 'Dr. John Smith',
                           rating: 3,
                           comment: 'The course content is comprehensive but could use more examples. Overall it was okay.',
                           submittedAt: '2024-01-13T09:15:00.000Z',
                           semester: '2024/1',
                           anonymous: true
                       },
                       {
                           id: 'FB_1703123456792_jkl012',
                           courseCode: 'MTH101',
                           courseTitle: 'Calculus I',
                           lecturerId: 'LEC002',
                           lecturerName: 'Prof. Mary Johnson',
                           rating: 5,
                           comment: 'Amazing professor! Makes complex topics easy to understand. Love the way she explains everything.',
                           submittedAt: '2024-01-12T16:45:00.000Z',
                           semester: '2024/1',
                           anonymous: true
                       },
                       {
                           id: 'FB_1703123456793_mno345',
                           courseCode: 'MTH101',
                           courseTitle: 'Calculus I',
                           lecturerId: 'LEC002',
                           lecturerName: 'Prof. Mary Johnson',
                           rating: 2,
                           comment: 'The course is too difficult and the explanations are confusing. I find it hard to follow.',
                           submittedAt: '2024-01-11T11:30:00.000Z',
                           semester: '2024/1',
                           anonymous: true
                       },
                       {
                           id: 'FB_1703123456794_pqr678',
                           courseCode: 'PHY101',
                           courseTitle: 'General Physics',
                           lecturerId: 'LEC003',
                           lecturerName: 'Dr. Robert Wilson',
                           rating: 4,
                           comment: 'Good course with practical experiments. The lab sessions are very helpful for understanding concepts.',
                           submittedAt: '2024-01-10T13:20:00.000Z',
                           semester: '2024/1',
                           anonymous: true
                       },
                       {
                           id: 'FB_1703123456795_stu901',
                           courseCode: 'PHY101',
                           courseTitle: 'General Physics',
                           lecturerId: 'LEC003',
                           lecturerName: 'Dr. Robert Wilson',
                           rating: 1,
                           comment: 'Terrible course. The lectures are boring and the material is presented in a confusing way.',
                           submittedAt: '2024-01-09T15:10:00.000Z',
                           semester: '2024/1',
                           anonymous: true
                       }
                   ],
                   courses: [
                       { code: 'CSC101', title: 'Introduction to Computer Science', lecturer: 'Dr. John Smith' },
                       { code: 'MTH101', title: 'Calculus I', lecturer: 'Prof. Mary Johnson' },
                       { code: 'PHY101', title: 'General Physics', lecturer: 'Dr. Robert Wilson' },
                       { code: 'ENG101', title: 'English Composition', lecturer: 'Dr. Sarah Davis' },
                       { code: 'CHE101', title: 'General Chemistry', lecturer: 'Prof. Michael Brown' }
                   ],
                   lecturers: [
                       { id: 'LEC001', name: 'Dr. John Smith', department: 'Computer Science', email: 'john.smith@university.edu' },
                       { id: 'LEC002', name: 'Prof. Mary Johnson', department: 'Mathematics', email: 'mary.johnson@university.edu' },
                       { id: 'LEC003', name: 'Dr. Robert Wilson', department: 'Physics', email: 'robert.wilson@university.edu' },
                       { id: 'LEC004', name: 'Dr. Sarah Davis', department: 'English', email: 'sarah.davis@university.edu' },
                       { id: 'LEC005', name: 'Prof. Michael Brown', department: 'Chemistry', email: 'michael.brown@university.edu' }
                   ]
               };
    }

    saveFeedbackData() {
        localStorage.setItem('intellgrade_feedback', JSON.stringify(this.feedbackData));
    }

    submitFeedback(feedbackData) {
        // Validate feedback data
        if (!this.validateFeedback(feedbackData)) {
            return { success: false, message: 'Please fill in all required fields and select a rating.' };
        }

        // Create feedback object
        const feedback = {
            id: this.generateFeedbackId(),
            courseCode: feedbackData.courseCode,
            courseTitle: feedbackData.courseTitle,
            lecturerId: feedbackData.lecturerId,
            lecturerName: feedbackData.lecturerName,
            rating: parseInt(feedbackData.rating),
            comment: feedbackData.comment || '',
            submittedAt: new Date().toISOString(),
            semester: feedbackData.semester || '2024/1',
            // Anonymous - no student information stored
            anonymous: true
        };

        // Add to feedback data
        this.feedbackData.feedbacks.push(feedback);
        this.saveFeedbackData();

        return { success: true, message: 'Feedback submitted successfully! Your response is anonymous.' };
    }

    validateFeedback(feedbackData) {
        return feedbackData.courseCode && 
               feedbackData.lecturerId && 
               feedbackData.rating > 0 && 
               feedbackData.rating <= 5;
    }

    generateFeedbackId() {
        return 'FB_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    getFeedbackByCourse(courseCode) {
        return this.feedbackData.feedbacks.filter(f => f.courseCode === courseCode);
    }

    getFeedbackByLecturer(lecturerId) {
        return this.feedbackData.feedbacks.filter(f => f.lecturerId === lecturerId);
    }

    getFeedbackBySemester(semester) {
        return this.feedbackData.feedbacks.filter(f => f.semester === semester);
    }

    getAllFeedback() {
        return this.feedbackData.feedbacks;
    }

    getCourses() {
        return this.feedbackData.courses;
    }

    getLecturers() {
        return this.feedbackData.lecturers;
    }

    getCourseByCode(courseCode) {
        return this.feedbackData.courses.find(c => c.code === courseCode);
    }

    getLecturerById(lecturerId) {
        return this.feedbackData.lecturers.find(l => l.id === lecturerId);
    }

    // Analytics methods
    getCourseAnalytics(courseCode) {
        const feedbacks = this.getFeedbackByCourse(courseCode);
        if (feedbacks.length === 0) {
            return null;
        }

        const totalRating = feedbacks.reduce((sum, f) => sum + f.rating, 0);
        const averageRating = totalRating / feedbacks.length;
        
        const ratingDistribution = {
            1: feedbacks.filter(f => f.rating === 1).length,
            2: feedbacks.filter(f => f.rating === 2).length,
            3: feedbacks.filter(f => f.rating === 3).length,
            4: feedbacks.filter(f => f.rating === 4).length,
            5: feedbacks.filter(f => f.rating === 5).length
        };

        return {
            totalFeedbacks: feedbacks.length,
            averageRating: averageRating.toFixed(1),
            ratingDistribution,
            recentFeedbacks: feedbacks.slice(-5).reverse()
        };
    }

    getLecturerAnalytics(lecturerId) {
        const feedbacks = this.getFeedbackByLecturer(lecturerId);
        if (feedbacks.length === 0) {
            return null;
        }

        const totalRating = feedbacks.reduce((sum, f) => sum + f.rating, 0);
        const averageRating = totalRating / feedbacks.length;
        
        const courses = [...new Set(feedbacks.map(f => f.courseCode))];
        const courseAnalytics = courses.map(courseCode => {
            const courseFeedbacks = feedbacks.filter(f => f.courseCode === courseCode);
            const courseTotal = courseFeedbacks.reduce((sum, f) => sum + f.rating, 0);
            const courseAvgRating = (courseTotal / courseFeedbacks.length).toFixed(1);
            
            // Calculate sentiment for this course
            const sentiment = this.analyzeSentiment(courseFeedbacks);
            
            return {
                courseCode,
                courseTitle: courseFeedbacks[0].courseTitle,
                averageRating: courseAvgRating,
                feedbackCount: courseFeedbacks.length,
                sentiment: sentiment
            };
        });

        // Calculate overall sentiment
        const overallSentiment = this.analyzeSentiment(feedbacks);

        return {
            totalFeedbacks: feedbacks.length,
            averageRating: averageRating.toFixed(1),
            courses: courseAnalytics,
            sentiment: overallSentiment,
            recentFeedbacks: feedbacks.slice(-5).reverse()
        };
    }

    // Sentiment Analysis Method
    analyzeSentiment(feedbacks) {
        if (feedbacks.length === 0) {
            return { positive: 0, neutral: 0, negative: 0, total: 0 };
        }

        let positive = 0, neutral = 0, negative = 0;

        feedbacks.forEach(feedback => {
            const rating = feedback.rating;
            const comment = feedback.comment ? feedback.comment.toLowerCase() : '';
            
            // Rating-based sentiment (primary)
            if (rating >= 4) {
                positive++;
            } else if (rating <= 2) {
                negative++;
            } else {
                neutral++;
            }
            
            // Comment-based sentiment analysis (secondary)
            const positiveWords = ['excellent', 'great', 'good', 'amazing', 'wonderful', 'fantastic', 'outstanding', 'perfect', 'love', 'enjoy', 'helpful', 'clear', 'understand', 'learn', 'improve'];
            const negativeWords = ['bad', 'poor', 'terrible', 'awful', 'horrible', 'confusing', 'difficult', 'hard', 'boring', 'waste', 'disappoint', 'frustrate', 'hate', 'dislike'];
            
            let positiveScore = 0, negativeScore = 0;
            
            positiveWords.forEach(word => {
                if (comment.includes(word)) positiveScore++;
            });
            
            negativeWords.forEach(word => {
                if (comment.includes(word)) negativeScore++;
            });
            
            // Adjust sentiment based on comment analysis
            if (positiveScore > negativeScore && rating === 3) {
                neutral--;
                positive++;
            } else if (negativeScore > positiveScore && rating === 3) {
                neutral--;
                negative++;
            }
        });

        return {
            positive: positive,
            neutral: neutral,
            negative: negative,
            total: feedbacks.length,
            positivePercentage: ((positive / feedbacks.length) * 100).toFixed(1),
            neutralPercentage: ((neutral / feedbacks.length) * 100).toFixed(1),
            negativePercentage: ((negative / feedbacks.length) * 100).toFixed(1)
        };
    }

    getOverallAnalytics() {
        const feedbacks = this.getAllFeedback();
        if (feedbacks.length === 0) {
            return null;
        }

        const totalRating = feedbacks.reduce((sum, f) => sum + f.rating, 0);
        const averageRating = totalRating / feedbacks.length;
        
        const courses = [...new Set(feedbacks.map(f => f.courseCode))];
        const lecturers = [...new Set(feedbacks.map(f => f.lecturerId))];

        return {
            totalFeedbacks: feedbacks.length,
            averageRating: averageRating.toFixed(1),
            totalCourses: courses.length,
            totalLecturers: lecturers.length,
            recentFeedbacks: feedbacks.slice(-10).reverse()
        };
    }

    // Export methods
    exportFeedbackToCSV(feedbacks = null) {
        const data = feedbacks || this.getAllFeedback();
        if (data.length === 0) {
            return '';
        }

        const headers = ['Course Code', 'Course Title', 'Lecturer', 'Rating', 'Comment', 'Semester', 'Submitted Date'];
        const csvContent = [
            headers.join(','),
            ...data.map(f => [
                f.courseCode,
                `"${f.courseTitle}"`,
                f.lecturerName,
                f.rating,
                `"${f.comment.replace(/"/g, '""')}"`,
                f.semester,
                new Date(f.submittedAt).toLocaleDateString()
            ].join(','))
        ].join('\n');

        return csvContent;
    }

    downloadCSV(csvContent, filename) {
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', filename);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    // UI Helper methods
    createRatingStars(container, currentRating = 0, readonly = false) {
        const ratingContainer = document.createElement('div');
        ratingContainer.className = 'rating-container d-flex align-items-center';
        
        const starsDiv = document.createElement('div');
        starsDiv.className = 'me-2';
        
        for (let i = 1; i <= 5; i++) {
            const star = document.createElement('i');
            star.className = `rating-star ${i <= currentRating ? 'fas text-warning' : 'far'}`;
            star.dataset.rating = i;
            star.style.cursor = readonly ? 'default' : 'pointer';
            star.style.fontSize = '1.2rem';
            star.style.marginRight = '2px';
            starsDiv.appendChild(star);
        }
        
        const hiddenInput = document.createElement('input');
        hiddenInput.type = 'hidden';
        hiddenInput.className = 'rating-value';
        hiddenInput.value = currentRating;
        
        const ratingText = document.createElement('span');
        ratingText.className = 'rating-text ms-2';
        ratingText.textContent = currentRating > 0 ? `${currentRating}/5` : 'No rating';
        
        ratingContainer.appendChild(starsDiv);
        ratingContainer.appendChild(hiddenInput);
        ratingContainer.appendChild(ratingText);
        
        container.appendChild(ratingContainer);
        return ratingContainer;
    }

    updateRatingText(container, rating) {
        const ratingText = container.querySelector('.rating-text');
        if (ratingText) {
            ratingText.textContent = rating > 0 ? `${rating}/5` : 'No rating';
        }
    }
}

// Global feedback manager instance
window.feedbackManager = new FeedbackManager();

// Utility functions for global access
function submitFeedback() {
    const form = document.getElementById('feedbackForm');
    if (!form) return;

    const formData = new FormData(form);
    const feedbackData = {
        courseCode: formData.get('courseCode'),
        courseTitle: form.querySelector('#feedbackCourse option:checked')?.text || '',
        lecturerId: formData.get('lecturerId'),
        lecturerName: form.querySelector('#feedbackLecturer option:checked')?.text || '',
        rating: formData.get('rating'),
        comment: formData.get('comment'),
        semester: formData.get('semester') || '2024/1'
    };

    const result = window.feedbackManager.submitFeedback(feedbackData);
    
    if (result.success) {
        Utils.showNotification(result.message, 'success');
        
        // Close modal
        const modal = bootstrap.Modal.getInstance(document.getElementById('submitFeedbackModal'));
        if (modal) modal.hide();
        
        // Reset form
        form.reset();
        const ratingContainer = form.querySelector('.rating-container');
        if (ratingContainer) {
            window.feedbackManager.setRating(ratingContainer, 0);
            window.feedbackManager.updateRatingText(ratingContainer, 0);
        }
        
        // Refresh feedback page if currently on it
        if (window.studentDashboard && window.studentDashboard.currentPage === 'feedback') {
            window.studentDashboard.loadFeedbackPage();
        }
    } else {
        Utils.showNotification(result.message, 'warning');
    }
}

function exportFeedback(format = 'csv') {
    const csvContent = window.feedbackManager.exportFeedbackToCSV();
    if (!csvContent) {
        Utils.showNotification('No feedback data to export', 'warning');
        return;
    }
    
    const filename = `feedback_export_${new Date().toISOString().split('T')[0]}.${format}`;
    window.feedbackManager.downloadCSV(csvContent, filename);
    Utils.showNotification(`Feedback exported as ${format.toUpperCase()} successfully!`, 'success');
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    if (window.feedbackManager) {
        window.feedbackManager.init();
    }
}); 