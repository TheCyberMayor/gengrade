// Result Management System for IntellGrade

class ResultManager {
    constructor() {
        this.gradePoints = {
            'A': 4.0, 'A-': 3.7, 'B+': 3.3, 'B': 3.0, 'B-': 2.7,
            'C+': 2.3, 'C': 2.0, 'C-': 1.7, 'D+': 1.3, 'D': 1.0, 'F': 0.0
        };
        
        this.gradeRanges = {
            'A': [90, 100], 'A-': [85, 89], 'B+': [80, 84], 'B': [75, 79], 'B-': [70, 74],
            'C+': [65, 69], 'C': [60, 64], 'C-': [55, 59], 'D+': [50, 54], 'D': [45, 49], 'F': [0, 44]
        };
        
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.loadSampleData();
    }

    setupEventListeners() {
        // CSV file upload handling
        const csvFileInput = document.getElementById('csvFile');
        if (csvFileInput) {
            csvFileInput.addEventListener('change', (e) => this.handleCSVUpload(e));
        }

        // Manual result form handling
        const manualResultForm = document.getElementById('manualResultForm');
        if (manualResultForm) {
            manualResultForm.addEventListener('submit', (e) => this.handleManualUpload(e));
        }

        // Bulk upload form handling
        const bulkUploadForm = document.getElementById('bulkUploadForm');
        if (bulkUploadForm) {
            bulkUploadForm.addEventListener('submit', (e) => this.handleBulkUpload(e));
        }
    }

    loadSampleData() {
        // Sample student results data
        this.sampleResults = {
            'STU001': {
                'name': 'Alice Johnson',
                'level': '300',
                'department': 'Computer Science',
                'semesters': {
                    '2024/1': {
                        'courses': [
                            { 'code': 'CSC101', 'title': 'Introduction to Computer Science', 'units': 3, 'score': 85, 'grade': 'A', 'gpa': 4.0 },
                            { 'code': 'MTH101', 'title': 'Calculus I', 'units': 4, 'score': 78, 'grade': 'B', 'gpa': 3.0 },
                            { 'code': 'PHY101', 'title': 'General Physics', 'units': 4, 'score': 92, 'grade': 'A', 'gpa': 4.0 },
                            { 'code': 'ENG101', 'title': 'English Composition', 'units': 2, 'score': 88, 'grade': 'A', 'gpa': 4.0 },
                            { 'code': 'GST101', 'title': 'Use of English', 'units': 2, 'score': 75, 'grade': 'B', 'gpa': 3.0 }
                        ],
                        'gpa': 3.73,
                        'totalUnits': 15
                    },
                    '2023/2': {
                        'courses': [
                            { 'code': 'CSC201', 'title': 'Data Structures', 'units': 4, 'score': 82, 'grade': 'B+', 'gpa': 3.3 },
                            { 'code': 'MTH201', 'title': 'Linear Algebra', 'units': 3, 'score': 79, 'grade': 'B', 'gpa': 3.0 },
                            { 'code': 'STA201', 'title': 'Statistics', 'units': 3, 'score': 85, 'grade': 'A', 'gpa': 4.0 },
                            { 'code': 'GST201', 'title': 'Philosophy', 'units': 2, 'score': 70, 'grade': 'B-', 'gpa': 2.7 }
                        ],
                        'gpa': 3.25,
                        'totalUnits': 12
                    }
                }
            },
            'STU002': {
                'name': 'Bob Williams',
                'level': '200',
                'department': 'Mathematics',
                'semesters': {
                    '2024/1': {
                        'courses': [
                            { 'code': 'MTH101', 'title': 'Calculus I', 'units': 4, 'score': 72, 'grade': 'B-', 'gpa': 2.7 },
                            { 'code': 'PHY101', 'title': 'General Physics', 'units': 4, 'score': 68, 'grade': 'C+', 'gpa': 2.3 },
                            { 'code': 'ENG101', 'title': 'English Composition', 'units': 2, 'score': 85, 'grade': 'A', 'gpa': 4.0 }
                        ],
                        'gpa': 2.9,
                        'totalUnits': 10
                    }
                }
            }
        };
    }

    // Calculate GPA for a semester
    calculateSemesterGPA(courses) {
        if (!courses || courses.length === 0) return 0;
        
        let totalGradePoints = 0;
        let totalUnits = 0;
        
        courses.forEach(course => {
            totalGradePoints += course.gpa * course.units;
            totalUnits += course.units;
        });
        
        return totalUnits > 0 ? totalGradePoints / totalUnits : 0;
    }

    // Calculate CGPA across all semesters
    calculateCGPA(studentId) {
        const student = this.sampleResults[studentId];
        if (!student || !student.semesters) return 0;
        
        let totalGradePoints = 0;
        let totalUnits = 0;
        
        Object.values(student.semesters).forEach(semester => {
            semester.courses.forEach(course => {
                totalGradePoints += course.gpa * course.units;
                totalUnits += course.units;
            });
        });
        
        return totalUnits > 0 ? totalGradePoints / totalUnits : 0;
    }

    // Convert score to grade
    scoreToGrade(score) {
        for (const [grade, range] of Object.entries(this.gradeRanges)) {
            if (score >= range[0] && score <= range[1]) {
                return grade;
            }
        }
        return 'F';
    }

    // Calculate grade points from grade
    gradeToPoints(grade) {
        return this.gradePoints[grade] || 0;
    }

    // Handle CSV file upload
    handleCSVUpload(event) {
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            const csvData = e.target.result;
            const results = this.parseCSV(csvData);
            this.displayCSVPreview(results);
        };
        reader.readAsText(file);
    }

    // Parse CSV data
    parseCSV(csvData) {
        const lines = csvData.split('\n');
        const headers = lines[0].split(',').map(h => h.trim());
        const results = [];

        for (let i = 1; i < lines.length; i++) {
            if (lines[i].trim()) {
                const values = lines[i].split(',').map(v => v.trim());
                const result = {};
                headers.forEach((header, index) => {
                    result[header] = values[index] || '';
                });
                results.push(result);
            }
        }

        return results;
    }

    // Display CSV preview
    displayCSVPreview(results) {
        const previewContainer = document.getElementById('csvPreview');
        if (!previewContainer) return;

        if (results.length === 0) {
            previewContainer.innerHTML = '<p class="text-danger">No valid data found in CSV file.</p>';
            return;
        }

        let html = '<div class="table-responsive"><table class="table table-sm table-bordered">';
        
        // Headers
        html += '<thead><tr>';
        Object.keys(results[0]).forEach(header => {
            html += `<th>${header}</th>`;
        });
        html += '</tr></thead>';

        // Data rows (show first 5)
        html += '<tbody>';
        results.slice(0, 5).forEach(row => {
            html += '<tr>';
            Object.values(row).forEach(value => {
                html += `<td>${value}</td>`;
            });
            html += '</tr>';
        });
        html += '</tbody></table></div>';

        if (results.length > 5) {
            html += `<p class="text-muted">Showing first 5 of ${results.length} records</p>`;
        }

        previewContainer.innerHTML = html;
        
        // Store results for processing
        this.csvResults = results;
    }

    // Handle manual result upload
    handleManualUpload(event) {
        event.preventDefault();
        
        const formData = new FormData(event.target);
        const resultData = {
            studentId: formData.get('studentId'),
            studentName: formData.get('studentName'),
            courseCode: formData.get('courseCode'),
            courseTitle: formData.get('courseTitle'),
            creditUnits: parseFloat(formData.get('creditUnits')),
            score: parseFloat(formData.get('score')),
            semester: formData.get('semester'),
            lecturer: formData.get('lecturer')
        };

        // Validate data
        if (!this.validateResultData(resultData)) {
            Utils.showNotification('Please fill in all required fields correctly', 'warning');
            return;
        }

        // Calculate grade and GPA
        resultData.grade = this.scoreToGrade(resultData.score);
        resultData.gpa = this.gradeToPoints(resultData.grade);

        // Process the result
        this.processResult(resultData);
        
        // Reset form
        event.target.reset();
        
        Utils.showNotification('Result uploaded successfully!', 'success');
    }

    // Handle bulk upload
    handleBulkUpload(event) {
        event.preventDefault();
        
        if (!this.csvResults || this.csvResults.length === 0) {
            Utils.showNotification('Please upload a CSV file first', 'warning');
            return;
        }

        // Process all CSV results
        let successCount = 0;
        let errorCount = 0;

        this.csvResults.forEach((row, index) => {
            const resultData = {
                studentId: row['Student ID'] || row['StudentID'],
                studentName: row['Student Name'] || row['StudentName'],
                courseCode: row['Course Code'] || row['CourseCode'],
                courseTitle: row['Course Title'] || row['CourseTitle'],
                creditUnits: parseFloat(row['Credit Units'] || row['Units'] || 3),
                score: parseFloat(row['Score'] || row['Mark']),
                semester: row['Semester'] || '2024/1',
                lecturer: row['Lecturer'] || 'Unknown'
            };

            if (this.validateResultData(resultData)) {
                resultData.grade = this.scoreToGrade(resultData.score);
                resultData.gpa = this.gradeToPoints(resultData.grade);
                this.processResult(resultData);
                successCount++;
            } else {
                errorCount++;
            }
        });

        Utils.showNotification(`Bulk upload completed: ${successCount} successful, ${errorCount} errors`, 
            errorCount === 0 ? 'success' : 'warning');
    }

    // Validate result data
    validateResultData(data) {
        return data.studentId && 
               data.studentName && 
               data.courseCode && 
               data.courseTitle && 
               data.creditUnits > 0 && 
               data.creditUnits <= 6 &&
               data.score >= 0 && 
               data.score <= 100 &&
               data.semester;
    }

    // Process and store result
    processResult(resultData) {
        // In a real system, this would save to a database
        // For demo purposes, we'll update the sample data
        
        if (!this.sampleResults[resultData.studentId]) {
            this.sampleResults[resultData.studentId] = {
                name: resultData.studentName,
                level: '300', // Default level
                department: 'Computer Science', // Default department
                semesters: {}
            };
        }

        if (!this.sampleResults[resultData.studentId].semesters[resultData.semester]) {
            this.sampleResults[resultData.studentId].semesters[resultData.semester] = {
                courses: [],
                gpa: 0,
                totalUnits: 0
            };
        }

        // Add or update course result
        const semester = this.sampleResults[resultData.studentId].semesters[resultData.semester];
        const existingCourseIndex = semester.courses.findIndex(c => c.code === resultData.courseCode);
        
        const courseData = {
            code: resultData.courseCode,
            title: resultData.courseTitle,
            units: resultData.creditUnits,
            score: resultData.score,
            grade: resultData.grade,
            gpa: resultData.gpa
        };

        if (existingCourseIndex >= 0) {
            semester.courses[existingCourseIndex] = courseData;
        } else {
            semester.courses.push(courseData);
        }

        // Recalculate semester GPA
        semester.gpa = this.calculateSemesterGPA(semester.courses);
        semester.totalUnits = semester.courses.reduce((sum, course) => sum + course.units, 0);

        // Store in localStorage for persistence
        localStorage.setItem('intellgrade_results', JSON.stringify(this.sampleResults));
    }

    // Get student results
    getStudentResults(studentId) {
        return this.sampleResults[studentId] || null;
    }

    // Get all results for admin/lecturer view
    getAllResults() {
        return this.sampleResults;
    }

    // Export results to CSV
    exportResultsToCSV(studentId = null) {
        let results = [];
        
        if (studentId) {
            // Export specific student results
            const student = this.sampleResults[studentId];
            if (student) {
                Object.entries(student.semesters).forEach(([semester, semesterData]) => {
                    semesterData.courses.forEach(course => {
                        results.push({
                            'Student ID': studentId,
                            'Student Name': student.name,
                            'Semester': semester,
                            'Course Code': course.code,
                            'Course Title': course.title,
                            'Credit Units': course.units,
                            'Score': course.score,
                            'Grade': course.grade,
                            'GPA': course.gpa
                        });
                    });
                });
            }
        } else {
            // Export all results
            Object.entries(this.sampleResults).forEach(([studentId, student]) => {
                Object.entries(student.semesters).forEach(([semester, semesterData]) => {
                    semesterData.courses.forEach(course => {
                        results.push({
                            'Student ID': studentId,
                            'Student Name': student.name,
                            'Semester': semester,
                            'Course Code': course.code,
                            'Course Title': course.title,
                            'Credit Units': course.units,
                            'Score': course.score,
                            'Grade': course.grade,
                            'GPA': course.gpa
                        });
                    });
                });
            });
        }

        return this.convertToCSV(results);
    }

    // Convert data to CSV format
    convertToCSV(data) {
        if (data.length === 0) return '';
        
        const headers = Object.keys(data[0]);
        const csvContent = [
            headers.join(','),
            ...data.map(row => headers.map(header => `"${row[header]}"`).join(','))
        ].join('\n');
        
        return csvContent;
    }

    // Download CSV file
    downloadCSV(csvContent, filename) {
        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
    }

    // Generate transcript HTML
    generateTranscriptHTML(studentId) {
        const student = this.sampleResults[studentId];
        if (!student) return '';

        const cgpa = this.calculateCGPA(studentId);
        
        let html = `
            <div class="transcript-container">
                <div class="transcript-header">
                    <h3>Academic Transcript</h3>
                    <div class="student-info">
                        <p><strong>Name:</strong> ${student.name}</p>
                        <p><strong>Student ID:</strong> ${studentId}</p>
                        <p><strong>Department:</strong> ${student.department}</p>
                        <p><strong>Level:</strong> ${student.level}</p>
                        <p><strong>CGPA:</strong> ${cgpa.toFixed(2)}</p>
                    </div>
                </div>
                <div class="transcript-body">
        `;

        Object.entries(student.semesters).forEach(([semester, semesterData]) => {
            html += `
                <div class="semester-section">
                    <h4>${semester} - Semester Results</h4>
                    <table class="table table-bordered">
                        <thead>
                            <tr>
                                <th>Course Code</th>
                                <th>Course Title</th>
                                <th>Credit Units</th>
                                <th>Score</th>
                                <th>Grade</th>
                                <th>Grade Points</th>
                            </tr>
                        </thead>
                        <tbody>
            `;

            semesterData.courses.forEach(course => {
                html += `
                    <tr>
                        <td>${course.code}</td>
                        <td>${course.title}</td>
                        <td>${course.units}</td>
                        <td>${course.score}</td>
                        <td>${course.grade}</td>
                        <td>${course.gpa}</td>
                    </tr>
                `;
            });

            html += `
                        </tbody>
                    </table>
                    <p><strong>Semester GPA:</strong> ${semesterData.gpa.toFixed(2)} | 
                       <strong>Total Units:</strong> ${semesterData.totalUnits}</p>
                </div>
            `;
        });

        html += `
                </div>
            </div>
        `;

        return html;
    }
}

// Initialize result manager
const resultManager = new ResultManager();

// Global functions for use in other scripts
window.ResultManager = ResultManager;
window.resultManager = resultManager; 