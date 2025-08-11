#!/usr/bin/env python3
"""
IntellGrade Sentiment Analysis Module
Simple keyword-based sentiment analysis for student feedback
"""

import re
import json
from typing import Dict, List, Tuple

class SentimentAnalyzer:
    def __init__(self):
        # Define positive and negative keywords for academic context
        self.positive_keywords = [
            'excellent', 'great', 'good', 'amazing', 'wonderful', 'fantastic', 'outstanding',
            'brilliant', 'superb', 'perfect', 'helpful', 'clear', 'understandable', 'interesting',
            'engaging', 'inspiring', 'motivating', 'supportive', 'patient', 'knowledgeable',
            'professional', 'organized', 'structured', 'comprehensive', 'thorough', 'detailed',
            'practical', 'useful', 'valuable', 'enjoyable', 'fun', 'exciting', 'stimulating',
            'challenging', 'rewarding', 'satisfying', 'fulfilling', 'educational', 'informative',
            'well-taught', 'well-explained', 'well-organized', 'well-structured', 'well-prepared',
            'approachable', 'friendly', 'encouraging', 'positive', 'constructive', 'effective',
            'efficient', 'productive', 'successful', 'achievement', 'improvement', 'progress',
            'development', 'growth', 'learning', 'understanding', 'comprehension', 'mastery'
        ]
        
        self.negative_keywords = [
            'bad', 'poor', 'terrible', 'awful', 'horrible', 'dreadful', 'disappointing',
            'frustrating', 'confusing', 'unclear', 'difficult', 'hard', 'complex', 'complicated',
            'boring', 'dull', 'monotonous', 'repetitive', 'tedious', 'annoying', 'irritating',
            'unhelpful', 'useless', 'pointless', 'waste', 'time-consuming', 'slow', 'inefficient',
            'disorganized', 'chaotic', 'messy', 'unstructured', 'unprepared', 'unprofessional',
            'rude', 'unfriendly', 'hostile', 'aggressive', 'intimidating', 'threatening',
            'discouraging', 'demotivating', 'depressing', 'stressful', 'overwhelming', 'exhausting',
            'tiring', 'draining', 'frustrating', 'confusing', 'misleading', 'inaccurate',
            'incorrect', 'wrong', 'false', 'untrue', 'incomplete', 'partial', 'superficial',
            'shallow', 'basic', 'elementary', 'simple', 'easy', 'trivial', 'insignificant',
            'unimportant', 'irrelevant', 'unnecessary', 'redundant', 'repetitive', 'monotonous'
        ]
        
        # Academic context modifiers
        self.intensifiers = ['very', 'extremely', 'really', 'quite', 'rather', 'somewhat', 'slightly']
        self.negators = ['not', 'no', 'never', 'none', 'neither', 'nor', 'hardly', 'barely', 'scarcely']
        
    def analyze_sentiment(self, text: str) -> Dict[str, any]:
        """
        Analyze the sentiment of a given text
        
        Args:
            text (str): The text to analyze
            
        Returns:
            Dict containing sentiment analysis results
        """
        if not text or not text.strip():
            return {
                'sentiment': 'neutral',
                'score': 0,
                'confidence': 0.0,
                'positive_words': [],
                'negative_words': [],
                'reasoning': 'Empty or null text provided'
            }
        
        # Clean and normalize text
        cleaned_text = self._clean_text(text.lower())
        
        # Find positive and negative words
        positive_words = self._find_words(cleaned_text, self.positive_keywords)
        negative_words = self._find_words(cleaned_text, self.negative_keywords)
        
        # Calculate sentiment score
        positive_score = self._calculate_word_score(cleaned_text, positive_words, self.positive_keywords)
        negative_score = self._calculate_word_score(cleaned_text, negative_words, self.negative_keywords)
        
        # Apply negation detection
        positive_score = self._apply_negation(cleaned_text, positive_score, positive_words)
        negative_score = self._apply_negation(cleaned_text, negative_score, negative_words)
        
        # Calculate final score
        final_score = positive_score - negative_score
        
        # Determine sentiment category
        sentiment, confidence = self._categorize_sentiment(final_score, len(positive_words), len(negative_words))
        
        return {
            'sentiment': sentiment,
            'score': final_score,
            'confidence': confidence,
            'positive_words': positive_words,
            'negative_words': negative_words,
            'positive_score': positive_score,
            'negative_score': negative_score,
            'reasoning': self._generate_reasoning(sentiment, final_score, positive_words, negative_words)
        }
    
    def _clean_text(self, text: str) -> str:
        """Clean and normalize text"""
        # Remove special characters but keep spaces
        text = re.sub(r'[^\w\s]', ' ', text)
        # Normalize whitespace
        text = re.sub(r'\s+', ' ', text).strip()
        return text
    
    def _find_words(self, text: str, word_list: List[str]) -> List[str]:
        """Find words from the given list in the text"""
        found_words = []
        words = text.split()
        
        for word in words:
            if word in word_list:
                found_words.append(word)
        
        return found_words
    
    def _calculate_word_score(self, text: str, found_words: List[str], word_list: List[str]) -> float:
        """Calculate score for found words with intensity modifiers"""
        score = 0.0
        words = text.split()
        
        for i, word in enumerate(words):
            if word in found_words:
                base_score = 1.0
                
                # Check for intensifiers
                if i > 0 and words[i-1] in self.intensifiers:
                    base_score *= 1.5
                elif i > 0 and words[i-1] in ['very', 'extremely']:
                    base_score *= 2.0
                
                score += base_score
        
        return score
    
    def _apply_negation(self, text: str, score: float, words: List[str]) -> float:
        """Apply negation detection to adjust scores"""
        words_list = text.split()
        negated_score = score
        
        for i, word in enumerate(words_list):
            if word in words:
                # Check for negators before the word
                for j in range(max(0, i-3), i):
                    if words_list[j] in self.negators:
                        negated_score -= 1.0  # Reduce positive score
                        break
        
        return max(0, negated_score)  # Ensure score doesn't go below 0
    
    def _categorize_sentiment(self, score: float, positive_count: int, negative_count: int) -> Tuple[str, float]:
        """Categorize sentiment based on score and word counts"""
        # Calculate confidence based on word count and score magnitude
        total_words = positive_count + negative_count
        
        if total_words == 0:
            return 'neutral', 0.0
        
        # Base confidence on word count
        confidence = min(1.0, total_words / 10.0)  # Max confidence at 10+ words
        
        # Adjust confidence based on score magnitude
        score_confidence = min(1.0, abs(score) / 5.0)  # Max confidence at score of 5+
        
        final_confidence = (confidence + score_confidence) / 2
        
        # Categorize sentiment
        if score > 1.0:
            return 'positive', final_confidence
        elif score < -1.0:
            return 'negative', final_confidence
        else:
            return 'neutral', final_confidence
    
    def _generate_reasoning(self, sentiment: str, score: float, positive_words: List[str], negative_words: List[str]) -> str:
        """Generate reasoning for the sentiment analysis"""
        if sentiment == 'positive':
            if positive_words:
                return f"Positive sentiment detected based on words: {', '.join(positive_words[:3])}"
            else:
                return "Positive sentiment based on overall score"
        elif sentiment == 'negative':
            if negative_words:
                return f"Negative sentiment detected based on words: {', '.join(negative_words[:3])}"
            else:
                return "Negative sentiment based on overall score"
        else:
            return "Neutral sentiment - balanced or insufficient indicators"
    
    def batch_analyze(self, texts: List[str]) -> List[Dict[str, any]]:
        """Analyze multiple texts at once"""
        results = []
        for text in texts:
            results.append(self.analyze_sentiment(text))
        return results
    
    def get_sentiment_summary(self, analyses: List[Dict[str, any]]) -> Dict[str, any]:
        """Generate summary statistics from multiple sentiment analyses"""
        if not analyses:
            return {
                'total_feedback': 0,
                'positive_count': 0,
                'negative_count': 0,
                'neutral_count': 0,
                'positive_percentage': 0,
                'negative_percentage': 0,
                'neutral_percentage': 0,
                'average_confidence': 0
            }
        
        total = len(analyses)
        positive_count = sum(1 for a in analyses if a['sentiment'] == 'positive')
        negative_count = sum(1 for a in analyses if a['sentiment'] == 'negative')
        neutral_count = sum(1 for a in analyses if a['sentiment'] == 'neutral')
        
        avg_confidence = sum(a['confidence'] for a in analyses) / total
        
        return {
            'total_feedback': total,
            'positive_count': positive_count,
            'negative_count': negative_count,
            'neutral_count': neutral_count,
            'positive_percentage': (positive_count / total) * 100,
            'negative_percentage': (negative_count / total) * 100,
            'neutral_percentage': (neutral_count / total) * 100,
            'average_confidence': avg_confidence
        }

# Example usage and testing
if __name__ == "__main__":
    analyzer = SentimentAnalyzer()
    
    # Test cases
    test_feedback = [
        "Excellent teaching methods and clear explanations. The practical sessions were very helpful.",
        "The course content is comprehensive but could use more examples.",
        "Very confusing and poorly organized. The lecturer is not helpful at all.",
        "Good course overall, but some topics need better explanation.",
        "Amazing lecturer! Very knowledgeable and patient with students.",
        "The course is too difficult and the lecturer doesn't explain well.",
        "Neutral feedback about the course structure.",
        "Outstanding course with brilliant teaching methods!"
    ]
    
    print("Sentiment Analysis Results:")
    print("=" * 50)
    
    for i, feedback in enumerate(test_feedback, 1):
        result = analyzer.analyze_sentiment(feedback)
        print(f"\n{i}. Feedback: {feedback}")
        print(f"   Sentiment: {result['sentiment'].upper()}")
        print(f"   Score: {result['score']:.2f}")
        print(f"   Confidence: {result['confidence']:.2f}")
        print(f"   Positive words: {result['positive_words']}")
        print(f"   Negative words: {result['negative_words']}")
        print(f"   Reasoning: {result['reasoning']}")
    
    # Batch analysis summary
    print("\n" + "=" * 50)
    print("BATCH ANALYSIS SUMMARY:")
    print("=" * 50)
    
    batch_results = analyzer.batch_analyze(test_feedback)
    summary = analyzer.get_sentiment_summary(batch_results)
    
    print(f"Total feedback: {summary['total_feedback']}")
    print(f"Positive: {summary['positive_count']} ({summary['positive_percentage']:.1f}%)")
    print(f"Negative: {summary['negative_count']} ({summary['negative_percentage']:.1f}%)")
    print(f"Neutral: {summary['neutral_count']} ({summary['neutral_percentage']:.1f}%)")
    print(f"Average confidence: {summary['average_confidence']:.2f}") 