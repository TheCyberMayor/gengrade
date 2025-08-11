class TranscriptManager {
    constructor() {
        this.transcriptData = this.loadTranscriptData();
        this.currentStudent = this.getCurrentStudent();
    }

    init() {
        this.loadStudentInfo();
        this.loadTranscriptContent();
        this.updateStatistics();
        this.setupEventListeners();
    }

    setupEventListeners() {
        document.getElementById('showGPA')?.addEventListener('change', (e) => {
            this.toggleGPADisplay(e.target.checked);
        });

        window.navigateToPage = (page) => {
            if (page === 'results') {
                window.location.href = 'dashboard.html#results';
            } else if (page === 'feedback') {
                window.location.href = 'dashboard.html#feedback';
            } else if (page === 'profile') {
                window.location.href = 'dashboard.html#profile';
            }
        };
    }

    loadTranscriptData() {
        const stored = localStorage.getItem('transcriptData');
        if (stored) {
            return JSON.parse(stored);
        }

        return {
            students: {
                'STU001': {
                    name: 'John Doe',
                    studentId: 'STU001',
                    program: 'Computer Science',
                    enrollmentDate: 'September 2022',
                    currentSemester: 'Fall 2024',
                    overallGPA: 3.75,
                    semesters: [
                        {
                            semester: 'Fall 2022',
                            gpa: 3.60,
                            courses: [
                                { code: 'CS101', name: 'Introduction to Programming', credits: 3, grade: 'A-', points: 3.7 },
                                { code: 'MATH101', name: 'Calculus I', credits: 4, grade: 'B+', points: 3.3 },
                                { code: 'ENG101', name: 'English Composition', credits: 3, grade: 'A', points: 4.0 },
                                { code: 'PHYS101', name: 'Physics I', credits: 4, grade: 'B', points: 3.0 }
                            ]
                        },
                        {
                            semester: 'Spring 2023',
                            gpa: 3.80,
                            courses: [
                                { code: 'CS201', name: 'Data Structures', credits: 3, grade: 'A', points: 4.0 },
                                { code: 'MATH201', name: 'Calculus II', credits: 4, grade: 'A-', points: 3.7 },
                                { code: 'CS202', name: 'Object-Oriented Programming', credits: 3, grade: 'A', points: 4.0 },
                                { code: 'STAT201', name: 'Statistics', credits: 3, grade: 'B+', points: 3.3 }
                            ]
                        },
                        {
                            semester: 'Fall 2023',
                            gpa: 3.85,
                            courses: [
                                { code: 'CS301', name: 'Algorithms', credits: 3, grade: 'A', points: 4.0 },
                                { code: 'CS302', name: 'Database Systems', credits: 3, grade: 'A-', points: 3.7 },
                                { code: 'CS303', name: 'Computer Networks', credits: 3, grade: 'A', points: 4.0 },
                                { code: 'MATH301', name: 'Linear Algebra', credits: 3, grade: 'B+', points: 3.3 }
                            ]
                        },
                        {
                            semester: 'Spring 2024',
                            gpa: 3.70,
                            courses: [
                                { code: 'CS401', name: 'Software Engineering', credits: 3, grade: 'A-', points: 3.7 },
                                { code: 'CS402', name: 'Operating Systems', credits: 3, grade: 'B+', points: 3.3 },
                                { code: 'CS403', name: 'Artificial Intelligence', credits: 3, grade: 'A', points: 4.0 },
                                { code: 'CS404', name: 'Web Development', credits: 3, grade: 'A-', points: 3.7 }
                            ]
                        },
                        {
                            semester: 'Fall 2024',
                            gpa: 3.80,
                            courses: [
                                { code: 'CS501', name: 'Machine Learning', credits: 3, grade: 'A', points: 4.0 },
                                { code: 'CS502', name: 'Computer Security', credits: 3, grade: 'A-', points: 3.7 },
                                { code: 'CS503', name: 'Cloud Computing', credits: 3, grade: 'A', points: 4.0 },
                                { code: 'CS504', name: 'Mobile App Development', credits: 3, grade: 'B+', points: 3.3 }
                            ]
                        }
                    ]
                }
            }
        };
    }

    getCurrentStudent() {
        return this.transcriptData.students['STU001'];
    }

    loadStudentInfo() {
        if (!this.currentStudent) return;

        document.getElementById('studentName').textContent = this.currentStudent.name;
        document.getElementById('studentId').textContent = this.currentStudent.studentId;
        document.getElementById('program').textContent = this.currentStudent.program;
        document.getElementById('enrollmentDate').textContent = this.currentStudent.enrollmentDate;
        document.getElementById('currentSemester').textContent = this.currentStudent.currentSemester;
        document.getElementById('overallGPA').textContent = this.currentStudent.overallGPA.toFixed(2);
    }

    loadTranscriptContent() {
        const container = document.getElementById('transcriptContent');
        if (!container || !this.currentStudent) return;

        let html = '';
        
        this.currentStudent.semesters.forEach((semester, index) => {
            html += this.generateSemesterHTML(semester, index);
        });

        container.innerHTML = html;
    }

    generateSemesterHTML(semester, index) {
        const isExpanded = index === this.currentStudent.semesters.length - 1;
        
        let html = `
            <div class="semester-section mb-4">
                <div class="semester-header" onclick="transcriptManager.toggleSemester(${index})" style="cursor: pointer;">
                    <div class="d-flex justify-content-between align-items-center p-3 bg-light rounded">
                        <h6 class="mb-0">
                            <i class="fas fa-chevron-${isExpanded ? 'down' : 'right'} me-2"></i>
                            ${semester.semester}
                        </h6>
                        <div class="d-flex align-items-center">
                            <span class="badge bg-primary me-2">${semester.courses.length} Courses</span>
                            <span class="badge bg-success">GPA: ${semester.gpa.toFixed(2)}</span>
                        </div>
                    </div>
                </div>
                <div class="semester-content ${isExpanded ? 'show' : ''}" id="semester-${index}">
                    <div class="table-responsive">
                        <table class="table table-striped table-hover">
                            <thead class="table-dark">
                                <tr>
                                    <th>Course Code</th>
                                    <th>Course Name</th>
                                    <th>Credits</th>
                                    <th>Grade</th>
                                    <th>Grade Points</th>
                                    <th>Quality Points</th>
                                </tr>
                            </thead>
                            <tbody>
        `;

        semester.courses.forEach(course => {
            const qualityPoints = course.credits * course.points;
            html += `
                <tr>
                    <td><strong>${course.code}</strong></td>
                    <td>${course.name}</td>
                    <td>${course.credits}</td>
                    <td><span class="badge bg-${this.getGradeColor(course.grade)}">${course.grade}</span></td>
                    <td>${course.points.toFixed(1)}</td>
                    <td>${qualityPoints.toFixed(1)}</td>
                </tr>
            `;
        });

        const totalCredits = semester.courses.reduce((sum, course) => sum + course.credits, 0);
        const totalQualityPoints = semester.courses.reduce((sum, course) => sum + (course.credits * course.points), 0);
        
        html += `
                            </tbody>
                            <tfoot class="table-secondary">
                                <tr>
                                    <td colspan="2"><strong>Semester Total</strong></td>
                                    <td><strong>${totalCredits}</strong></td>
                                    <td colspan="2"><strong>GPA: ${semester.gpa.toFixed(2)}</strong></td>
                                    <td><strong>${totalQualityPoints.toFixed(1)}</strong></td>
                                </tr>
                            </tfoot>
                        </table>
                    </div>
                </div>
            </div>
        `;

        return html;
    }

    getGradeColor(grade) {
        const gradeColors = {
            'A': 'success', 'A-': 'success',
            'B+': 'primary', 'B': 'primary', 'B-': 'primary',
            'C+': 'warning', 'C': 'warning', 'C-': 'warning',
            'D+': 'danger', 'D': 'danger', 'F': 'danger'
        };
        return gradeColors[grade] || 'secondary';
    }

    toggleSemester(index) {
        const content = document.getElementById(`semester-${index}`);
        const header = content.previousElementSibling;
        const icon = header.querySelector('i');
        
        if (content.classList.contains('show')) {
            content.classList.remove('show');
            icon.className = 'fas fa-chevron-right me-2';
        } else {
            content.classList.add('show');
            icon.className = 'fas fa-chevron-down me-2';
        }
    }

    toggleGPADisplay(show) {
        const gpaElements = document.querySelectorAll('.badge.bg-success');
        gpaElements.forEach(element => {
            element.style.display = show ? 'inline-block' : 'none';
        });
    }

    updateStatistics() {
        if (!this.currentStudent) return;

        const totalCredits = this.currentStudent.semesters.reduce((sum, semester) => {
            return sum + semester.courses.reduce((semesterSum, course) => semesterSum + course.credits, 0);
        }, 0);

        const completedCourses = this.currentStudent.semesters.reduce((sum, semester) => {
            return sum + semester.courses.length;
        }, 0);

        const semestersCompleted = this.currentStudent.semesters.length;

        document.getElementById('totalCredits').textContent = totalCredits;
        document.getElementById('completedCourses').textContent = completedCourses;
        document.getElementById('semestersCompleted').textContent = semestersCompleted;
    }

    async downloadTranscript() {
        try {
            const pdfContainer = document.createElement('div');
            pdfContainer.className = 'pdf-container';
            pdfContainer.style.padding = '20px';
            pdfContainer.style.backgroundColor = 'white';
            pdfContainer.style.color = 'black';
            pdfContainer.style.fontSize = '12px';
            pdfContainer.style.lineHeight = '1.4';

            pdfContainer.innerHTML = `
                <div style="text-align: center; margin-bottom: 30px;">
                    <h2 style="color: #333; margin-bottom: 5px;">IntellGrade University</h2>
                    <h3 style="color: #666; margin-bottom: 20px;">Academic Transcript</h3>
                </div>
                
                <div style="margin-bottom: 20px;">
                    <table style="width: 100%; border-collapse: collapse;">
                        <tr>
                            <td style="width: 50%; vertical-align: top;">
                                <p><strong>Student Name:</strong> ${this.currentStudent.name}</p>
                                <p><strong>Student ID:</strong> ${this.currentStudent.studentId}</p>
                                <p><strong>Program:</strong> ${this.currentStudent.program}</p>
                            </td>
                            <td style="width: 50%; vertical-align: top;">
                                <p><strong>Enrollment Date:</strong> ${this.currentStudent.enrollmentDate}</p>
                                <p><strong>Current Semester:</strong> ${this.currentStudent.currentSemester}</p>
                                <p><strong>Overall GPA:</strong> ${this.currentStudent.overallGPA.toFixed(2)}</p>
                            </td>
                        </tr>
                    </table>
                </div>
            `;

            this.currentStudent.semesters.forEach(semester => {
                pdfContainer.innerHTML += `
                    <div style="margin-bottom: 20px;">
                        <h4 style="color: #333; border-bottom: 2px solid #333; padding-bottom: 5px;">
                            ${semester.semester} - GPA: ${semester.gpa.toFixed(2)}
                        </h4>
                        <table style="width: 100%; border-collapse: collapse; margin-top: 10px;">
                            <thead>
                                <tr style="background-color: #f8f9fa;">
                                    <th style="border: 1px solid #ddd; padding: 8px; text-align: left;">Course</th>
                                    <th style="border: 1px solid #ddd; padding: 8px; text-align: left;">Course Name</th>
                                    <th style="border: 1px solid #ddd; padding: 8px; text-align: center;">Credits</th>
                                    <th style="border: 1px solid #ddd; padding: 8px; text-align: center;">Grade</th>
                                    <th style="border: 1px solid #ddd; padding: 8px; text-align: center;">Points</th>
                                </tr>
                            </thead>
                            <tbody>
                `;

                semester.courses.forEach(course => {
                    pdfContainer.innerHTML += `
                        <tr>
                            <td style="border: 1px solid #ddd; padding: 8px;">${course.code}</td>
                            <td style="border: 1px solid #ddd; padding: 8px;">${course.name}</td>
                            <td style="border: 1px solid #ddd; padding: 8px; text-align: center;">${course.credits}</td>
                            <td style="border: 1px solid #ddd; padding: 8px; text-align: center;">${course.grade}</td>
                            <td style="border: 1px solid #ddd; padding: 8px; text-align: center;">${course.points.toFixed(1)}</td>
                        </tr>
                    `;
                });

                const totalCredits = semester.courses.reduce((sum, course) => sum + course.credits, 0);
                pdfContainer.innerHTML += `
                            </tbody>
                            <tfoot>
                                <tr style="background-color: #f8f9fa;">
                                    <td colspan="2" style="border: 1px solid #ddd; padding: 8px;"><strong>Semester Total</strong></td>
                                    <td style="border: 1px solid #ddd; padding: 8px; text-align: center;"><strong>${totalCredits}</strong></td>
                                    <td style="border: 1px solid #ddd; padding: 8px; text-align: center;"><strong>GPA: ${semester.gpa.toFixed(2)}</strong></td>
                                    <td style="border: 1px solid #ddd; padding: 8px;"></td>
                                </tr>
                            </tfoot>
                        </table>
                    </div>
                `;
            });

            const totalCredits = this.currentStudent.semesters.reduce((sum, semester) => {
                return sum + semester.courses.reduce((semesterSum, course) => semesterSum + course.credits, 0);
            }, 0);

            pdfContainer.innerHTML += `
                <div style="margin-top: 30px; padding: 15px; background-color: #f8f9fa; border-radius: 5px;">
                    <h4 style="color: #333; margin-bottom: 15px;">Summary</h4>
                    <p><strong>Total Credits:</strong> ${totalCredits}</p>
                    <p><strong>Overall GPA:</strong> ${this.currentStudent.overallGPA.toFixed(2)}</p>
                    <p><strong>Semesters Completed:</strong> ${this.currentStudent.semesters.length}</p>
                </div>
            `;

            document.body.appendChild(pdfContainer);
            pdfContainer.style.position = 'absolute';
            pdfContainer.style.left = '-9999px';

            const canvas = await html2canvas(pdfContainer, {
                scale: 2,
                useCORS: true,
                allowTaint: true
            });

            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF('p', 'mm', 'a4');
            const imgWidth = 210;
            const pageHeight = 295;
            const imgHeight = (canvas.height * imgWidth) / canvas.width;
            let heightLeft = imgHeight;

            let position = 0;

            pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
            heightLeft -= pageHeight;

            while (heightLeft >= 0) {
                position = heightLeft - imgHeight;
                pdf.addPage();
                pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
                heightLeft -= pageHeight;
            }

            pdf.save(`${this.currentStudent.name.replace(/\s+/g, '_')}_Transcript.pdf`);

            document.body.removeChild(pdfContainer);

        } catch (error) {
            console.error('Error generating PDF:', error);
            alert('Error generating PDF. Please try again.');
        }
    }

    printTranscript() {
        window.print();
    }
}

function downloadTranscript() {
    if (window.transcriptManager) {
        window.transcriptManager.downloadTranscript();
    }
}

function printTranscript() {
    if (window.transcriptManager) {
        window.transcriptManager.printTranscript();
    }
}

document.addEventListener('DOMContentLoaded', function() {
    window.transcriptManager = new TranscriptManager();
    window.transcriptManager.init();
}); 