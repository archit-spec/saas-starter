import { useState, useCallback } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Line, Bar } from 'react-chartjs-2';
import { analyzeText, analyzeImage, generateInsights } from '../actions/openai';
import { type TextAnalysis, type ImageAnalysis, type DashboardInsights } from '../types/openai';
import PaymentButton from '../components/PaymentButton';
import { toast } from 'sonner';
import { useSubscription } from '../context/SubscriptionContext';
import { HiLockClosed } from 'react-icons/hi';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface DashboardData {
  images: Array<{
    id: string;
    data: string;
    analysis: ImageAnalysis;
  }>;
  text: Array<{
    id: string;
    content: string;
    analysis: TextAnalysis;
  }>;
  insights?: DashboardInsights;
  metrics: {
    totalImages: number;
    totalTexts: number;
  };
}

export default function DashboardProcessor() {
  const [dashboardData, setDashboardData] = useState<DashboardData>({
    images: [],
    text: [],
    metrics: {
      totalImages: 0,
      totalTexts: 0,
    },
  });
  const [selectedChart, setSelectedChart] = useState<'line' | 'bar'>('line');
  const { isPremium, updateSubscriptionStatus } = useSubscription();

  // Handle image upload
  const handleImageUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    for (const file of Array.from(files)) {
      try {
        const base64Data = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = (event) => {
            if (event.target?.result) {
              resolve(event.target.result as string);
            } else {
              reject(new Error('Failed to read file'));
            }
          };
          reader.onerror = () => reject(reader.error);
          reader.readAsDataURL(file);
        });

        const analysis = await analyzeImage(base64Data);
        const newImage = {
          id: `img-${Date.now()}`,
          data: base64Data,
          analysis,
        };

        setDashboardData(prev => ({
          ...prev,
          images: [...prev.images, newImage],
          metrics: {
            ...prev.metrics,
            totalImages: prev.metrics.totalImages + 1,
          },
        }));
      } catch (error) {
        console.error('Error processing image:', error);
      }
    }
  }, []);

  // Handle text input
  const handleTextInput = useCallback(async (content: string) => {
    try {
      const analysis = await analyzeText(content);
      const newText = {
        id: `txt-${Date.now()}`,
        content,
        analysis,
      };

      setDashboardData(prev => ({
        ...prev,
        text: [...prev.text, newText],
        metrics: {
          ...prev.metrics,
          totalTexts: prev.metrics.totalTexts + 1,
        },
      }));
    } catch (error) {
      console.error('Error analyzing text:', error);
    }
  }, []);

  // Generate insights
  const handleGenerateInsights = async () => {
    try {
      const insights = await generateInsights(dashboardData);
      setDashboardData(prev => ({
        ...prev,
        insights,
      }));
    } catch (error) {
      console.error('Error generating insights:', error);
    }
  };

  // Generate chart data
  const chartData = {
    labels: dashboardData.text.map(t => t.id.slice(0, 8)),
    datasets: [
      {
        label: 'Sentiment Analysis',
        data: dashboardData.text.map(t => ({
          x: t.id.slice(0, 8),
          y: t.analysis.sentiment.score,
          label: t.analysis.sentiment.label,
        })),
        borderColor: 'rgb(75, 192, 192)',
        backgroundColor: 'rgba(75, 192, 192, 0.5)',
      },
    ],
  };

  // Generate action buttons based on data
  const generateActionButtons = () => {
    const actions = [];
    if (dashboardData.images.length > 0 || dashboardData.text.length > 0) {
      actions.push({
        label: 'Generate Insights',
        action: handleGenerateInsights,
      });
    }
    return actions;
  };

  // Premium feature: Advanced analysis limit
  const MAX_FREE_ANALYSES = 5;
  const isAnalysisLimited = !isPremium && 
    (dashboardData.images.length + dashboardData.text.length) >= MAX_FREE_ANALYSES;

  return (
    <div className="space-y-6">
      {/* Input Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-4 border rounded-lg">
          <h3 className="text-lg font-semibold mb-4">Image Upload</h3>
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={handleImageUpload}
            className="w-full"
          />
        </div>
        <div className="p-4 border rounded-lg">
          <h3 className="text-lg font-semibold mb-4">Text Input</h3>
          <textarea
            className="w-full p-2 border rounded"
            rows={4}
            onChange={(e) => handleTextInput(e.target.value)}
            placeholder="Enter text for analysis..."
          />
        </div>
      </div>

      {/* Visualization Section */}
      <div className="p-4 border rounded-lg">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Data Visualization</h3>
          <div className="space-x-2">
            <button
              onClick={() => setSelectedChart('line')}
              className={`px-3 py-1 rounded ${
                selectedChart === 'line' ? 'bg-blue-500 text-white' : 'bg-gray-200'
              }`}
            >
              Line
            </button>
            <button
              onClick={() => setSelectedChart('bar')}
              className={`px-3 py-1 rounded ${
                selectedChart === 'bar' ? 'bg-blue-500 text-white' : 'bg-gray-200'
              }`}
            >
              Bar
            </button>
          </div>
        </div>
        <div className="h-[400px]">
          {selectedChart === 'line' ? (
            <Line data={chartData} options={{ maintainAspectRatio: false }} />
          ) : (
            <Bar data={chartData} options={{ maintainAspectRatio: false }} />
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-2">
        {generateActionButtons().map((button, index) => (
          <button
            key={index}
            onClick={button.action}
            disabled={isAnalysisLimited}
            className={`px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            {button.label}
          </button>
        ))}
      </div>

      {isAnalysisLimited && !isPremium && (
        <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-yellow-800">
            You've reached the free analysis limit. Upgrade to Premium to analyze unlimited content!
          </p>
        </div>
      )}

      {/* Premium Features Section */}
      {!isPremium && (
        <div className="mt-8 p-6 border rounded-lg bg-gradient-to-r from-purple-50 to-blue-50">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-xl font-bold text-gray-900">Upgrade to Premium</h3>
              <p className="text-gray-600 mt-2">
                Get access to advanced analytics features:
              </p>
              <ul className="list-none mt-4 space-y-3">
                {[
                  'Unlimited analysis credits',
                  'Advanced AI-powered insights',
                  'Custom report generation',
                  'Real-time data processing',
                  'Priority support',
                  'Export data in multiple formats'
                ].map((feature, index) => (
                  <li key={index} className="flex items-center text-gray-700">
                    <HiLockClosed className="mr-2 text-gray-400" />
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-gray-900 mb-2">₹9<span className="text-lg font-normal text-gray-600">/month</span></div>
              <div className="text-sm text-gray-500 mb-4">Limited time offer!</div>
              <PaymentButton 
                amount={9}
                onSuccess={async () => {
                  await updateSubscriptionStatus(true);
                  toast.success("Welcome to Premium! Refreshing your dashboard...");
                }}
                onError={() => toast.error("Payment failed. Please try again.")}
              />
            </div>
          </div>
        </div>
      )}

      {/* Premium-only Features */}
      {isPremium && (
        <div className="mt-8 space-y-6">
          <div className="p-4 border rounded-lg bg-gradient-to-r from-green-50 to-emerald-50">
            <h3 className="text-lg font-semibold text-emerald-800 mb-2">Premium Features Enabled</h3>
            <p className="text-emerald-600">
              You have access to all premium features including unlimited analysis, advanced insights, and priority support.
            </p>
          </div>
          
          {/* Advanced Analytics Section (Premium Only) */}
          <div className="p-6 border rounded-lg">
            <h3 className="text-lg font-semibold mb-4">Advanced Analytics</h3>
            {/* Add your premium-only analytics components here */}
          </div>
        </div>
      )}

      {/* Insights Section */}
      {dashboardData.insights && (
        <div className="p-4 border rounded-lg">
          <h3 className="text-lg font-semibold mb-4">AI-Generated Insights</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-medium mb-2">Key Patterns</h4>
              <ul className="list-disc pl-5">
                {Array.isArray(dashboardData.insights.patterns) 
                  ? dashboardData.insights.patterns.map((pattern, i) => (
                      <li key={i}>{pattern}</li>
                    ))
                  : <li>{dashboardData.insights.patterns || 'No patterns found'}</li>
                }
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-2">Common Themes</h4>
              <ul className="list-disc pl-5">
                {Array.isArray(dashboardData.insights.themes)
                  ? dashboardData.insights.themes.map((theme, i) => (
                      <li key={i}>{theme}</li>
                    ))
                  : <li>{dashboardData.insights.themes || 'No themes found'}</li>
                }
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-2">Correlations</h4>
              <ul className="list-disc pl-5">
                {Array.isArray(dashboardData.insights.correlations)
                  ? dashboardData.insights.correlations.map((correlation, i) => (
                      <li key={i}>{correlation}</li>
                    ))
                  : <li>{dashboardData.insights.correlations || 'No correlations found'}</li>
                }
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-2">Recommendations</h4>
              <ul className="list-disc pl-5">
                {Array.isArray(dashboardData.insights.recommendations)
                  ? dashboardData.insights.recommendations.map((recommendation, i) => (
                      <li key={i}>{recommendation}</li>
                    ))
                  : <li>{dashboardData.insights.recommendations || 'No recommendations found'}</li>
                }
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* JSON Output */}
      <div className="p-4 border rounded-lg">
        <h3 className="text-lg font-semibold mb-4">Generated JSON</h3>
        <pre className="bg-gray-100 p-4 rounded overflow-auto max-h-[200px]">
          {JSON.stringify(dashboardData, null, 2)}
        </pre>
      </div>
    </div>
  );
}
