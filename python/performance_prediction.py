#!/usr/bin/env python3
"""
IntellGrade Performance Prediction Module
Simple machine learning for student performance prediction
"""

import numpy as np
import pandas as pd
from typing import Dict, List, Tuple, Optional
import json
from datetime import datetime

class PerformancePredictor:
    def __init__(self):
        self.model = None
        self.feature_names = [
            'previous_gpa', 'attendance_rate', 'assignment_completion',
            'midterm_score', 'course_difficulty', 'study_hours_per_week',
            'previous_course_performance', 'department_average'
        ]
        
        # Initialize with sample data for demonstration
        self.sample_data = self._generate_sample_data()
        self._train_model()
    
    def _generate_sample_data(self) -> pd.DataFrame:
        """Generate sample student performance data for training"""
        np.random.seed(42)  # For reproducible results
        
        n_samples = 1000
        
        data = {
            'student_id': [f'STU{i:03d}' for i in range(1, n_samples + 1)],
            'previous_gpa': np.random.normal(3.0, 0.8, n_samples).clip(1.0, 4.0),
            'attendance_rate': np.random.uniform(0.6, 1.0, n_samples),
            'assignment_completion': np.random.uniform(0.5, 1.0, n_samples),
            'midterm_score': np.random.normal(75, 15, n_samples).clip(0, 100),
            'course_difficulty': np.random.choice([1, 2, 3, 4, 5], n_samples, p=[0.1, 0.2, 0.4, 0.2, 0.1]),
            'study_hours_per_week': np.random.normal(15, 8, n_samples).clip(0, 40),
            'previous_course_performance': np.random.normal(75, 15, n_samples).clip(0, 100),
            'department_average': np.random.normal(72, 8, n_samples).clip(60, 85),
            'final_score': np.random.normal(78, 12, n_samples).clip(0, 100)
        }
        
        # Add some correlation between features and target
        data['final_score'] = (
            data['previous_gpa'] * 15 +
            data['attendance_rate'] * 20 +
            data['assignment_completion'] * 15 +
            data['midterm_score'] * 0.3 +
            (6 - data['course_difficulty']) * 5 +
            data['study_hours_per_week'] * 0.5 +
            data['previous_course_performance'] * 0.2 +
            np.random.normal(0, 8, n_samples)
        ).clip(0, 100)
        
        return pd.DataFrame(data)
    
    def _train_model(self):
        """Train a simple linear regression model"""
        from sklearn.linear_model import LinearRegression
        from sklearn.model_selection import train_test_split
        from sklearn.preprocessing import StandardScaler
        
        # Prepare features and target
        X = self.sample_data[self.feature_names]
        y = self.sample_data['final_score']
        
        # Split data
        X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
        
        # Scale features
        self.scaler = StandardScaler()
        X_train_scaled = self.scaler.fit_transform(X_train)
        X_test_scaled = self.scaler.transform(X_test)
        
        # Train model
        self.model = LinearRegression()
        self.model.fit(X_train_scaled, y_train)
        
        # Calculate model performance
        train_score = self.model.score(X_train_scaled, y_train)
        test_score = self.model.score(X_test_scaled, y_test)
        
        self.model_performance = {
            'train_r2': train_score,
            'test_r2': test_score,
            'feature_importance': dict(zip(self.feature_names, self.model.coef_))
        }
    
    def predict_performance(self, student_data: Dict[str, float]) -> Dict[str, any]:
        """
        Predict student performance based on input features
        
        Args:
            student_data: Dictionary containing student features
            
        Returns:
            Dictionary with prediction results
        """
        try:
            # Validate input data
            missing_features = [f for f in self.feature_names if f not in student_data]
            if missing_features:
                return {
                    'error': f"Missing required features: {missing_features}",
                    'prediction': None,
                    'confidence': 0.0,
                    'risk_level': 'unknown'
                }
            
            # Prepare feature vector
            features = np.array([student_data[f] for f in self.feature_names]).reshape(1, -1)
            
            # Scale features
            features_scaled = self.scaler.transform(features)
            
            # Make prediction
            predicted_score = self.model.predict(features_scaled)[0]
            predicted_score = max(0, min(100, predicted_score))  # Clip to valid range
            
            # Calculate confidence based on feature values
            confidence = self._calculate_confidence(student_data)
            
            # Determine risk level
            risk_level = self._determine_risk_level(predicted_score, confidence)
            
            # Generate recommendations
            recommendations = self._generate_recommendations(student_data, predicted_score, risk_level)
            
            return {
                'prediction': round(predicted_score, 2),
                'confidence': confidence,
                'risk_level': risk_level,
                'recommendations': recommendations,
                'feature_importance': self._get_feature_importance(student_data),
                'model_performance': self.model_performance
            }
            
        except Exception as e:
            return {
                'error': f"Prediction failed: {str(e)}",
                'prediction': None,
                'confidence': 0.0,
                'risk_level': 'unknown'
            }
    
    def _calculate_confidence(self, student_data: Dict[str, float]) -> float:
        """Calculate confidence in prediction based on data quality"""
        confidence = 0.8  # Base confidence
        
        # Adjust based on data completeness and reasonableness
        if student_data['attendance_rate'] < 0.5:
            confidence -= 0.1
        if student_data['assignment_completion'] < 0.5:
            confidence -= 0.1
        if student_data['study_hours_per_week'] < 5:
            confidence -= 0.1
        if student_data['study_hours_per_week'] > 30:
            confidence -= 0.05
        
        return max(0.3, min(0.95, confidence))
    
    def _determine_risk_level(self, predicted_score: float, confidence: float) -> str:
        """Determine student risk level based on predicted score and confidence"""
        if predicted_score >= 80:
            return 'low'
        elif predicted_score >= 70:
            return 'medium'
        elif predicted_score >= 60:
            return 'high'
        else:
            return 'critical'
    
    def _generate_recommendations(self, student_data: Dict[str, float], 
                                predicted_score: float, risk_level: str) -> List[str]:
        """Generate personalized recommendations for the student"""
        recommendations = []
        
        # Attendance recommendations
        if student_data['attendance_rate'] < 0.8:
            recommendations.append("Increase class attendance to improve performance")
        
        # Assignment recommendations
        if student_data['assignment_completion'] < 0.8:
            recommendations.append("Complete all assignments on time")
        
        # Study time recommendations
        if student_data['study_hours_per_week'] < 15:
            recommendations.append("Increase study hours to at least 15 hours per week")
        elif student_data['study_hours_per_week'] > 25:
            recommendations.append("Consider study efficiency - quality over quantity")
        
        # Performance-based recommendations
        if predicted_score < 70:
            recommendations.append("Seek additional academic support and tutoring")
            recommendations.append("Meet with course instructor to discuss improvement strategies")
        
        if risk_level in ['high', 'critical']:
            recommendations.append("Consider reducing course load or taking prerequisite courses")
            recommendations.append("Develop a detailed study schedule and stick to it")
        
        # General recommendations
        recommendations.append("Participate actively in class discussions and group activities")
        recommendations.append("Form study groups with classmates")
        
        return recommendations
    
    def _get_feature_importance(self, student_data: Dict[str, float]) -> Dict[str, float]:
        """Get feature importance for the specific student"""
        importance = {}
        for feature in self.feature_names:
            importance[feature] = round(self.model_performance['feature_importance'][feature], 4)
        return importance
    
    def batch_predict(self, students_data: List[Dict[str, float]]) -> List[Dict[str, any]]:
        """Predict performance for multiple students"""
        results = []
        for student_data in students_data:
            results.append(self.predict_performance(student_data))
        return results
    
    def get_performance_summary(self, predictions: List[Dict[str, any]]) -> Dict[str, any]:
        """Generate summary statistics from multiple predictions"""
        valid_predictions = [p for p in predictions if p.get('prediction') is not None]
        
        if not valid_predictions:
            return {
                'total_students': 0,
                'average_predicted_score': 0,
                'risk_distribution': {},
                'recommendations_summary': []
            }
        
        scores = [p['prediction'] for p in valid_predictions]
        risk_levels = [p['risk_level'] for p in valid_predictions]
        
        # Calculate risk distribution
        risk_distribution = {}
        for risk in ['low', 'medium', 'high', 'critical']:
            risk_distribution[risk] = risk_levels.count(risk)
        
        # Generate common recommendations
        all_recommendations = []
        for p in valid_predictions:
            all_recommendations.extend(p.get('recommendations', []))
        
        # Count recommendation frequency
        from collections import Counter
        recommendation_counts = Counter(all_recommendations)
        common_recommendations = [rec for rec, count in recommendation_counts.most_common(5)]
        
        return {
            'total_students': len(valid_predictions),
            'average_predicted_score': round(np.mean(scores), 2),
            'min_predicted_score': round(min(scores), 2),
            'max_predicted_score': round(max(scores), 2),
            'std_predicted_score': round(np.std(scores), 2),
            'risk_distribution': risk_distribution,
            'recommendations_summary': common_recommendations
        }
    
    def update_model(self, new_data: pd.DataFrame):
        """Update model with new data"""
        # Combine with existing data
        combined_data = pd.concat([self.sample_data, new_data], ignore_index=True)
        
        # Retrain model
        self.sample_data = combined_data
        self._train_model()
    
    def export_model_info(self) -> Dict[str, any]:
        """Export model information for storage"""
        return {
            'model_type': 'LinearRegression',
            'feature_names': self.feature_names,
            'model_performance': self.model_performance,
            'training_date': datetime.now().isoformat(),
            'sample_size': len(self.sample_data)
        }

# Example usage and testing
if __name__ == "__main__":
    predictor = PerformancePredictor()
    
    # Test cases
    test_students = [
        {
            'previous_gpa': 3.5,
            'attendance_rate': 0.9,
            'assignment_completion': 0.95,
            'midterm_score': 85,
            'course_difficulty': 3,
            'study_hours_per_week': 20,
            'previous_course_performance': 80,
            'department_average': 75
        },
        {
            'previous_gpa': 2.0,
            'attendance_rate': 0.6,
            'assignment_completion': 0.7,
            'midterm_score': 60,
            'course_difficulty': 4,
            'study_hours_per_week': 10,
            'previous_course_performance': 65,
            'department_average': 75
        },
        {
            'previous_gpa': 3.8,
            'attendance_rate': 0.95,
            'assignment_completion': 1.0,
            'midterm_score': 92,
            'course_difficulty': 2,
            'study_hours_per_week': 25,
            'previous_course_performance': 88,
            'department_average': 75
        }
    ]
    
    print("Performance Prediction Results:")
    print("=" * 60)
    
    for i, student_data in enumerate(test_students, 1):
        result = predictor.predict_performance(student_data)
        
        if 'error' in result:
            print(f"\n{i}. Error: {result['error']}")
        else:
            print(f"\n{i}. Student Performance Prediction:")
            print(f"   Predicted Score: {result['prediction']}")
            print(f"   Confidence: {result['confidence']:.2f}")
            print(f"   Risk Level: {result['risk_level'].upper()}")
            print(f"   Recommendations:")
            for rec in result['recommendations'][:3]:  # Show first 3 recommendations
                print(f"     - {rec}")
    
    # Batch prediction summary
    print("\n" + "=" * 60)
    print("BATCH PREDICTION SUMMARY:")
    print("=" * 60)
    
    batch_results = predictor.batch_predict(test_students)
    summary = predictor.get_performance_summary(batch_results)
    
    print(f"Total students: {summary['total_students']}")
    print(f"Average predicted score: {summary['average_predicted_score']}")
    print(f"Score range: {summary['min_predicted_score']} - {summary['max_predicted_score']}")
    print(f"Risk distribution: {summary['risk_distribution']}")
    print(f"Common recommendations:")
    for rec in summary['recommendations_summary']:
        print(f"  - {rec}")
    
    # Model performance
    print(f"\nModel Performance:")
    print(f"Training R²: {predictor.model_performance['train_r2']:.3f}")
    print(f"Test R²: {predictor.model_performance['test_r2']:.3f}")
    
    print(f"\nFeature Importance:")
    for feature, importance in predictor.model_performance['feature_importance'].items():
        print(f"  {feature}: {importance:.3f}") 