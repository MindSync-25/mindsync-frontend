import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { fetchTaskTemplates } from '../services/taskApi';

interface TaskTemplate {
  id: string;
  name: string;
  description: string;
  category?: string;
  estimatedDuration?: number; // minutes
  priority?: 'low' | 'medium' | 'high' | string;
  tags?: string[];
  tasks?: Array<{
    title: string;
    description: string;
    estimatedDuration?: number;
    dependencies?: string[];
  }>;
  // Additional backend fields that might be present
  template_id?: string;
  title?: string;
  estimated_duration?: number;
  template_data?: any;
  createdAt?: string;
  updatedAt?: string;
}

interface TaskTemplatesProps {
  visible: boolean;
  onClose: () => void;
  onTemplateSelect: (template: TaskTemplate) => void;
}

const TaskTemplates: React.FC<TaskTemplatesProps> = ({ visible, onClose, onTemplateSelect }) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [templates, setTemplates] = useState<TaskTemplate[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  // Fetch templates when component becomes visible
  useEffect(() => {
    if (visible) {
      loadTemplates();
    }
  }, [visible]);

  const loadTemplates = async (retryCount = 0) => {
    const maxRetries = 2; // Try up to 3 times (initial + 2 retries)
    
    setLoading(true);
    if (retryCount === 0) {
      setError(''); // Only clear error on first attempt
    }
    
    try {
      console.log(`🔄 Loading templates from backend... (attempt ${retryCount + 1}/${maxRetries + 1})`);
      const backendTemplates = await fetchTaskTemplates();
      
      if (backendTemplates.length === 0) {
        console.log('⚠️ No templates available from backend, using fallback templates');
        setTemplates(getFallbackTemplates());
      } else {
        console.log('✅ Templates loaded from backend:', backendTemplates.length);
        console.log('🔍 Raw backend template data:', JSON.stringify(backendTemplates, null, 2));
        
        // Transform backend templates to match our interface
        const transformedTemplates = backendTemplates.map((template, index) => {
          console.log(`🔄 Transforming template ${index + 1}:`, template);
          
          const transformed = {
            id: template.id || template.uuid || template.template_id || `template_${index}`,
            name: template.name || template.title || template.templateName || `Template ${index + 1}`,
            description: template.description || template.templateDescription || 'No description available',
            category: template.category || template.type || 'General',
            estimatedDuration: template.estimatedDuration || template.estimated_duration || 60,
            priority: (template.priority || 'medium').toLowerCase(),
            tags: Array.isArray(template.tags) ? template.tags : 
                  (typeof template.tags === 'string' ? template.tags.split(',') : []),
            tasks: template.tasks || template.template_data?.tasks || template.steps || []
          };
          
          console.log(`✅ Transformed template ${index + 1}:`, transformed);
          return transformed;
        });
        
        setTemplates(transformedTemplates);
        setError(''); // Clear any previous errors
      }
    } catch (err: any) {
      console.error(`❌ Failed to load templates (attempt ${retryCount + 1}):`, err);
      
      // If we haven't reached max retries and it's a timeout/connection error, try again
      if (retryCount < maxRetries && 
          (err.message?.includes('timeout') || 
           err.message?.includes('taking too long') ||
           err.message?.includes('ECONNABORTED'))) {
        
        console.log(`🔄 Retrying in 2 seconds... (${retryCount + 1}/${maxRetries} retries used)`);
        setTimeout(() => {
          loadTemplates(retryCount + 1);
        }, 2000); // Wait 2 seconds before retry
        return; // Don't set loading to false yet
      }
      
      // Provide specific error messages based on error type
      let errorMessage = 'Failed to load templates from server';
      
      if (err.message?.includes('Authentication required')) {
        errorMessage = 'Please log in again to access templates. Using offline templates.';
        // Could add navigation to login here if needed
      } else if (err.message?.includes('timeout') || err.message?.includes('taking too long')) {
        errorMessage = 'Server is taking too long to respond. Using offline templates.';
      } else if (err.message?.includes('Cannot connect') || err.message?.includes('ECONNREFUSED')) {
        errorMessage = 'Cannot connect to server. Using offline templates.';
      } else if (err.message?.includes('not found')) {
        errorMessage = 'Template service not available. Using offline templates.';
      } else if (err.message?.includes('server error')) {
        errorMessage = 'Server error occurred. Using offline templates.';
      }
      
      setError(errorMessage);
      
      // Always use fallback templates when API fails
      console.log('📦 Loading fallback templates...');
      setTemplates(getFallbackTemplates());
    } finally {
      setLoading(false);
    }
  };

  // Fallback templates if backend is not available
  const getFallbackTemplates = (): TaskTemplate[] => [
    {
      id: '1',
      name: 'Software Project',
      description: 'Complete software development project workflow',
      category: 'Development',
      estimatedDuration: 2400, // 40 hours
      priority: 'high',
      tags: ['development', 'coding', 'testing'],
      tasks: [
        { title: 'Requirements Analysis', description: 'Gather and analyze project requirements', estimatedDuration: 240 },
        { title: 'System Design', description: 'Create system architecture and design', estimatedDuration: 480, dependencies: ['Requirements Analysis'] },
        { title: 'Development Phase 1', description: 'Implement core functionality', estimatedDuration: 720, dependencies: ['System Design'] },
        { title: 'Testing', description: 'Unit and integration testing', estimatedDuration: 360, dependencies: ['Development Phase 1'] },
        { title: 'Deployment', description: 'Deploy to production environment', estimatedDuration: 120, dependencies: ['Testing'] }
      ]
    },
    {
      id: '2',
      name: 'Marketing Campaign',
      description: 'Launch a complete marketing campaign',
      category: 'Marketing',
      estimatedDuration: 960, // 16 hours
      priority: 'medium',
      tags: ['marketing', 'social media', 'content'],
      tasks: [
        { title: 'Market Research', description: 'Research target audience and competitors', estimatedDuration: 240 },
        { title: 'Content Strategy', description: 'Develop content strategy and calendar', estimatedDuration: 180, dependencies: ['Market Research'] },
        { title: 'Create Content', description: 'Design and create marketing materials', estimatedDuration: 360, dependencies: ['Content Strategy'] },
        { title: 'Campaign Launch', description: 'Launch campaign across channels', estimatedDuration: 120, dependencies: ['Create Content'] },
        { title: 'Monitor & Optimize', description: 'Track performance and optimize', estimatedDuration: 60, dependencies: ['Campaign Launch'] }
      ]
    },
    {
      id: '3',
      name: 'Event Planning',
      description: 'Organize a corporate event or conference',
      category: 'Events',
      estimatedDuration: 1200, // 20 hours
      priority: 'high',
      tags: ['event', 'planning', 'coordination'],
      tasks: [
        { title: 'Define Event Goals', description: 'Set objectives and success metrics', estimatedDuration: 60 },
        { title: 'Budget Planning', description: 'Create detailed budget breakdown', estimatedDuration: 120, dependencies: ['Define Event Goals'] },
        { title: 'Venue Selection', description: 'Research and book event venue', estimatedDuration: 240, dependencies: ['Budget Planning'] },
        { title: 'Vendor Coordination', description: 'Coordinate with catering, AV, etc.', estimatedDuration: 180, dependencies: ['Venue Selection'] },
        { title: 'Guest Management', description: 'Send invitations and manage RSVPs', estimatedDuration: 120, dependencies: ['Venue Selection'] },
        { title: 'Event Execution', description: 'Manage event day operations', estimatedDuration: 480, dependencies: ['Vendor Coordination', 'Guest Management'] }
      ]
    },
    {
      id: '4',
      name: 'Product Launch',
      description: 'End-to-end product launch process',
      category: 'Product',
      estimatedDuration: 1800, // 30 hours
      priority: 'high',
      tags: ['product', 'launch', 'go-to-market'],
      tasks: [
        { title: 'Product Finalization', description: 'Complete final product development', estimatedDuration: 480 },
        { title: 'Documentation', description: 'Create user guides and documentation', estimatedDuration: 240, dependencies: ['Product Finalization'] },
        { title: 'Marketing Materials', description: 'Develop launch marketing content', estimatedDuration: 360, dependencies: ['Product Finalization'] },
        { title: 'Sales Training', description: 'Train sales team on new product', estimatedDuration: 180, dependencies: ['Documentation'] },
        { title: 'Beta Testing', description: 'Conduct final beta testing round', estimatedDuration: 240, dependencies: ['Product Finalization'] },
        { title: 'Launch Event', description: 'Execute product launch event', estimatedDuration: 120, dependencies: ['Marketing Materials', 'Sales Training'] },
        { title: 'Post-Launch Support', description: 'Monitor and support initial rollout', estimatedDuration: 180, dependencies: ['Launch Event'] }
      ]
    }
  ]; // Close the getFallbackTemplates function

  const categories = ['all', ...Array.from(new Set(templates.map(t => t.category).filter(Boolean)))];

  const filteredTemplates = selectedCategory === 'all' 
    ? templates 
    : templates.filter(t => t.category === selectedCategory);

  const getPriorityColor = (priority?: string) => {
    if (!priority) return '#CCCCCC';
    switch (priority.toLowerCase()) {
      case 'high': return '#FF3B30';
      case 'medium': return '#FFA500';
      case 'low': return '#00C896';
      default: return '#CCCCCC';
    }
  };

  const formatDuration = (minutes?: number) => {
    if (!minutes) return 'No estimate';
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours === 0) return `${mins}m`;
    if (mins === 0) return `${hours}h`;
    return `${hours}h ${mins}m`;
  };

  if (!visible) return null;

  return (
    <View style={styles.overlay}>
      <View style={styles.modal}>
        <View style={styles.header}>
          <Text style={styles.title}>📋 Task Templates</Text>
          <TouchableOpacity onPress={onClose}>
            <Ionicons name="close" size={24} color="#C6D0F5" />
          </TouchableOpacity>
        </View>

        {/* Loading State */}
        {loading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#C6D0F5" />
            <Text style={styles.loadingText}>Loading templates...</Text>
          </View>
        )}

        {/* Error State */}
        {error && !loading && (
          <View style={styles.errorContainer}>
            <Ionicons name="warning-outline" size={24} color="#FF3B30" />
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity style={styles.retryButton} onPress={loadTemplates}>
              <Text style={styles.retryButtonText}>Retry</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Templates Content */}
        {!loading && !error && (
          <>
            {/* Category Filter */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoriesContainer}>
              {categories.map(category => (
                <TouchableOpacity
                  key={category}
                  style={[
                    styles.categoryButton,
                    selectedCategory === category && styles.activeCategoryButton
                  ]}
                  onPress={() => setSelectedCategory(category)}
                >
                  <Text style={[
                    styles.categoryText,
                    selectedCategory === category && styles.activeCategoryText
                  ]}>
                    {category.charAt(0).toUpperCase() + category.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <ScrollView style={styles.content}>
              {filteredTemplates.length === 0 ? (
                <View style={styles.emptyContainer}>
                  <Ionicons name="folder-outline" size={48} color="#666" />
                  <Text style={styles.emptyText}>No templates available</Text>
                  <Text style={styles.emptySubtext}>Templates will appear here when available</Text>
                </View>
              ) : (
                filteredTemplates.map(template => (
            <TouchableOpacity
              key={template.id}
              style={styles.templateCard}
              onPress={() => onTemplateSelect(template)}
            >
              <View style={styles.templateHeader}>
                <Text style={styles.templateName}>{template.name}</Text>
                {template.priority && (
                  <View style={[styles.priorityBadge, { backgroundColor: getPriorityColor(template.priority) }]}>
                    <Text style={styles.priorityText}>{template.priority.toUpperCase()}</Text>
                  </View>
                )}
              </View>
              
              <Text style={styles.templateDescription}>{template.description}</Text>
              
              <View style={styles.templateMeta}>
                {template.estimatedDuration && (
                  <View style={styles.metaItem}>
                    <Ionicons name="time-outline" size={14} color="#CCCCCC" />
                    <Text style={styles.metaText}>{formatDuration(template.estimatedDuration)}</Text>
                  </View>
                )}
                <View style={styles.metaItem}>
                  <Ionicons name="list-outline" size={14} color="#CCCCCC" />
                  <Text style={styles.metaText}>{(template.tasks || []).length} tasks</Text>
                </View>
                {template.category && template.category !== 'General' && (
                  <View style={styles.metaItem}>
                    <Ionicons name="folder-outline" size={14} color="#CCCCCC" />
                    <Text style={styles.metaText}>{template.category}</Text>
                  </View>
                )}
              </View>
              
              {template.tags && template.tags.length > 0 && (
                <View style={styles.tagsContainer}>
                  {template.tags.slice(0, 3).map(tag => (
                    <View key={tag} style={styles.tag}>
                      <Text style={styles.tagText}>#{tag}</Text>
                    </View>
                  ))}
                  {template.tags.length > 3 && (
                    <Text style={styles.moreTagsText}>+{template.tags.length - 3} more</Text>
                  )}
                </View>
              )}
            </TouchableOpacity>
                ))
              )}
            </ScrollView>
          </>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  modal: {
    backgroundColor: '#1a1a1a',
    borderRadius: 16,
    padding: 20,
    width: '95%',
    maxWidth: 500,
    maxHeight: '85%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#C6D0F5',
  },
  categoriesContainer: {
    marginBottom: 16,
  },
  categoryButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#2a2a2a',
    marginRight: 8,
  },
  activeCategoryButton: {
    backgroundColor: '#007AFF',
  },
  categoryText: {
    color: '#CCCCCC',
    fontSize: 14,
    fontWeight: '500',
  },
  activeCategoryText: {
    color: '#FFFFFF',
  },
  content: {
    maxHeight: 400,
  },
  templateCard: {
    backgroundColor: '#2a2a2a',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#3a3a3a',
  },
  templateHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  templateName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#C6D0F5',
    flex: 1,
  },
  priorityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  priorityText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  templateDescription: {
    fontSize: 14,
    color: '#CCCCCC',
    marginBottom: 12,
  },
  templateMeta: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 12,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: 12,
    color: '#CCCCCC',
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  tag: {
    backgroundColor: '#333333',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  tagText: {
    fontSize: 11,
    color: '#00C896',
  },
  moreTagsText: {
    fontSize: 11,
    color: '#888888',
    fontStyle: 'italic',
  },
  loadingContainer: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    color: '#CCCCCC',
    marginTop: 12,
    fontSize: 16,
  },
  errorContainer: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorText: {
    color: '#FF3B30',
    marginTop: 8,
    textAlign: 'center',
    fontSize: 14,
  },
  retryButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    marginTop: 12,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    color: '#CCCCCC',
    fontSize: 16,
    fontWeight: '600',
    marginTop: 12,
    textAlign: 'center',
  },
  emptySubtext: {
    color: '#888888',
    fontSize: 14,
    marginTop: 4,
    textAlign: 'center',
  },
});

export default TaskTemplates;
