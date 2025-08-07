import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  FlatList,
  Alert,
  Dimensions,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';

const { width } = Dimensions.get('window');

interface CollaborationWorkspaceProps {
  visible: boolean;
  onClose: () => void;
  projectId?: string;
}

interface TeamMember {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role: 'owner' | 'admin' | 'member' | 'guest';
  status: 'online' | 'offline' | 'away';
  lastSeen?: Date;
}

interface WorkspaceActivity {
  id: string;
  type: 'task_created' | 'task_completed' | 'comment_added' | 'file_shared' | 'member_joined';
  description: string;
  timestamp: Date;
  user: TeamMember;
  relatedItem?: string;
}

interface SharedResource {
  id: string;
  name: string;
  type: 'document' | 'image' | 'video' | 'link' | 'other';
  size?: string;
  sharedBy: TeamMember;
  sharedAt: Date;
  url?: string;
}

const CollaborationWorkspace: React.FC<CollaborationWorkspaceProps> = ({
  visible,
  onClose,
  projectId,
}) => {
  const { theme } = useTheme();
  const [activeTab, setActiveTab] = useState<'team' | 'activity' | 'resources'>('team');
  const [inviteModalVisible, setInviteModalVisible] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<'member' | 'admin'>('member');

  // Mock data - in real app, this would come from API
  const [teamMembers] = useState<TeamMember[]>([
    {
      id: '1',
      name: 'Alice Johnson',
      email: 'alice@company.com',
      role: 'owner',
      status: 'online',
    },
    {
      id: '2',
      name: 'Bob Smith',
      email: 'bob@company.com',
      role: 'admin',
      status: 'online',
    },
    {
      id: '3',
      name: 'Carol Davis',
      email: 'carol@company.com',
      role: 'member',
      status: 'away',
      lastSeen: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
    },
    {
      id: '4',
      name: 'David Wilson',
      email: 'david@company.com',
      role: 'member',
      status: 'offline',
      lastSeen: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
    },
  ]);

  const [activities] = useState<WorkspaceActivity[]>([
    {
      id: '1',
      type: 'task_completed',
      description: 'completed "Review API documentation"',
      timestamp: new Date(Date.now() - 1000 * 60 * 15),
      user: teamMembers[1],
      relatedItem: 'Task #123',
    },
    {
      id: '2',
      type: 'comment_added',
      description: 'added a comment to "Mobile app redesign"',
      timestamp: new Date(Date.now() - 1000 * 60 * 45),
      user: teamMembers[2],
      relatedItem: 'Task #122',
    },
    {
      id: '3',
      type: 'file_shared',
      description: 'shared wireframes.pdf',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2),
      user: teamMembers[0],
    },
    {
      id: '4',
      type: 'task_created',
      description: 'created "Setup CI/CD pipeline"',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 4),
      user: teamMembers[1],
      relatedItem: 'Task #124',
    },
  ]);

  const [sharedResources] = useState<SharedResource[]>([
    {
      id: '1',
      name: 'Project Requirements.pdf',
      type: 'document',
      size: '2.3 MB',
      sharedBy: teamMembers[0],
      sharedAt: new Date(Date.now() - 1000 * 60 * 60 * 24),
    },
    {
      id: '2',
      name: 'UI Mockups.sketch',
      type: 'document',
      size: '15.7 MB',
      sharedBy: teamMembers[2],
      sharedAt: new Date(Date.now() - 1000 * 60 * 60 * 12),
    },
    {
      id: '3',
      name: 'Demo Video',
      type: 'video',
      size: '45.2 MB',
      sharedBy: teamMembers[1],
      sharedAt: new Date(Date.now() - 1000 * 60 * 60 * 6),
    },
  ]);

  const tabs = [
    { id: 'team', label: 'Team', icon: 'people' as keyof typeof Ionicons.glyphMap },
    { id: 'activity', label: 'Activity', icon: 'pulse' as keyof typeof Ionicons.glyphMap },
    { id: 'resources', label: 'Resources', icon: 'folder' as keyof typeof Ionicons.glyphMap },
  ];

  const handleInviteMember = () => {
    if (!inviteEmail.trim()) {
      Alert.alert('Error', 'Please enter an email address.');
      return;
    }

    // In real app, this would send an API request
    Alert.alert(
      'Invitation Sent',
      `Invitation sent to ${inviteEmail} with ${inviteRole} role.`,
      [
        {
          text: 'OK',
          onPress: () => {
            setInviteEmail('');
            setInviteModalVisible(false);
          },
        },
      ]
    );
  };

  const getStatusColor = (status: TeamMember['status']) => {
    switch (status) {
      case 'online':
        return '#4CAF50';
      case 'away':
        return '#FF9800';
      case 'offline':
        return '#9E9E9E';
      default:
        return '#9E9E9E';
    }
  };

  const getActivityIcon = (type: WorkspaceActivity['type']) => {
    switch (type) {
      case 'task_created':
        return 'add-circle';
      case 'task_completed':
        return 'checkmark-circle';
      case 'comment_added':
        return 'chatbubble';
      case 'file_shared':
        return 'document';
      case 'member_joined':
        return 'person-add';
      default:
        return 'information-circle';
    }
  };

  const getResourceIcon = (type: SharedResource['type']) => {
    switch (type) {
      case 'document':
        return 'document-text';
      case 'image':
        return 'image';
      case 'video':
        return 'videocam';
      case 'link':
        return 'link';
      default:
        return 'attach';
    }
  };

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 60) {
      return `${diffInMinutes}m ago`;
    } else if (diffInMinutes < 1440) {
      return `${Math.floor(diffInMinutes / 60)}h ago`;
    } else {
      return `${Math.floor(diffInMinutes / 1440)}d ago`;
    }
  };

  const dynamicStyles = StyleSheet.create({
    overlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      justifyContent: 'flex-end',
    },
    container: {
      backgroundColor: theme === 'light' ? '#fff' : '#1a1a1a',
      borderTopLeftRadius: 20,
      borderTopRightRadius: 20,
      height: '90%',
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: 20,
      borderBottomWidth: 1,
      borderBottomColor: theme === 'light' ? '#e0e0e0' : '#333',
    },
    title: {
      fontSize: 20,
      fontWeight: 'bold',
      color: theme === 'light' ? '#000' : '#fff',
    },
    closeButton: {
      width: 32,
      height: 32,
      borderRadius: 16,
      backgroundColor: theme === 'light' ? '#f0f0f0' : '#333',
      alignItems: 'center',
      justifyContent: 'center',
    },
    tabContainer: {
      flexDirection: 'row',
      backgroundColor: theme === 'light' ? '#f8f9fa' : '#2a2a2a',
      paddingHorizontal: 20,
    },
    tab: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 16,
      borderBottomWidth: 2,
      borderBottomColor: 'transparent',
    },
    activeTab: {
      borderBottomColor: '#007AFF',
    },
    tabIcon: {
      marginRight: 8,
    },
    tabText: {
      fontSize: 14,
      fontWeight: '500',
      color: theme === 'light' ? '#666' : '#aaa',
    },
    activeTabText: {
      color: '#007AFF',
    },
    content: {
      flex: 1,
      padding: 20,
    },
    memberItem: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 12,
      borderBottomWidth: 1,
      borderBottomColor: theme === 'light' ? '#f0f0f0' : '#333',
    },
    memberAvatar: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: theme === 'light' ? '#e0e0e0' : '#555',
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: 12,
    },
    memberAvatarText: {
      fontSize: 16,
      fontWeight: 'bold',
      color: theme === 'light' ? '#666' : '#aaa',
    },
    memberInfo: {
      flex: 1,
    },
    memberName: {
      fontSize: 16,
      fontWeight: '500',
      color: theme === 'light' ? '#000' : '#fff',
      marginBottom: 2,
    },
    memberEmail: {
      fontSize: 14,
      color: theme === 'light' ? '#666' : '#aaa',
    },
    memberStatus: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    statusDot: {
      width: 8,
      height: 8,
      borderRadius: 4,
      marginRight: 8,
    },
    statusText: {
      fontSize: 12,
      color: theme === 'light' ? '#666' : '#aaa',
    },
    roleBadge: {
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 12,
      backgroundColor: '#007AFF20',
      marginLeft: 8,
    },
    roleText: {
      fontSize: 12,
      color: '#007AFF',
      fontWeight: '500',
    },
    inviteButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#007AFF',
      paddingHorizontal: 16,
      paddingVertical: 12,
      borderRadius: 8,
      marginBottom: 20,
    },
    inviteButtonText: {
      color: '#fff',
      fontSize: 16,
      fontWeight: '500',
      marginLeft: 8,
    },
    activityItem: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      paddingVertical: 12,
      borderBottomWidth: 1,
      borderBottomColor: theme === 'light' ? '#f0f0f0' : '#333',
    },
    activityIcon: {
      width: 32,
      height: 32,
      borderRadius: 16,
      backgroundColor: theme === 'light' ? '#f0f0f0' : '#333',
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: 12,
    },
    activityContent: {
      flex: 1,
    },
    activityText: {
      fontSize: 14,
      color: theme === 'light' ? '#000' : '#fff',
      marginBottom: 4,
    },
    activityUser: {
      fontWeight: '500',
    },
    activityTime: {
      fontSize: 12,
      color: theme === 'light' ? '#666' : '#aaa',
    },
    resourceItem: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 12,
      borderBottomWidth: 1,
      borderBottomColor: theme === 'light' ? '#f0f0f0' : '#333',
    },
    resourceIcon: {
      width: 40,
      height: 40,
      borderRadius: 8,
      backgroundColor: theme === 'light' ? '#f0f0f0' : '#333',
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: 12,
    },
    resourceInfo: {
      flex: 1,
    },
    resourceName: {
      fontSize: 16,
      fontWeight: '500',
      color: theme === 'light' ? '#000' : '#fff',
      marginBottom: 2,
    },
    resourceMeta: {
      fontSize: 12,
      color: theme === 'light' ? '#666' : '#aaa',
    },
    resourceActions: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    actionButton: {
      width: 32,
      height: 32,
      borderRadius: 16,
      backgroundColor: theme === 'light' ? '#f0f0f0' : '#333',
      alignItems: 'center',
      justifyContent: 'center',
      marginLeft: 8,
    },
    emptyState: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 32,
    },
    emptyText: {
      fontSize: 16,
      color: theme === 'light' ? '#666' : '#aaa',
      textAlign: 'center',
      marginTop: 12,
    },
    // Invite Modal Styles
    inviteModalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    inviteModalContainer: {
      backgroundColor: theme === 'light' ? '#fff' : '#1a1a1a',
      borderRadius: 12,
      padding: 20,
      width: width - 40,
      maxWidth: 400,
    },
    inviteModalTitle: {
      fontSize: 18,
      fontWeight: 'bold',
      color: theme === 'light' ? '#000' : '#fff',
      marginBottom: 16,
      textAlign: 'center',
    },
    inputGroup: {
      marginBottom: 16,
    },
    label: {
      fontSize: 14,
      fontWeight: '500',
      color: theme === 'light' ? '#000' : '#fff',
      marginBottom: 8,
    },
    input: {
      backgroundColor: theme === 'light' ? '#f8f9fa' : '#333',
      borderRadius: 8,
      padding: 12,
      fontSize: 16,
      color: theme === 'light' ? '#000' : '#fff',
      borderWidth: 1,
      borderColor: theme === 'light' ? '#e0e0e0' : '#555',
    },
    roleContainer: {
      flexDirection: 'row',
      gap: 12,
    },
    roleButton: {
      flex: 1,
      padding: 12,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: theme === 'light' ? '#e0e0e0' : '#555',
      alignItems: 'center',
    },
    selectedRole: {
      borderColor: '#007AFF',
      backgroundColor: '#007AFF10',
    },
    roleButtonText: {
      fontSize: 14,
      fontWeight: '500',
      color: theme === 'light' ? '#000' : '#fff',
    },
    selectedRoleText: {
      color: '#007AFF',
    },
    modalButtonContainer: {
      flexDirection: 'row',
      gap: 12,
      marginTop: 20,
    },
    modalButton: {
      flex: 1,
      padding: 12,
      borderRadius: 8,
      alignItems: 'center',
    },
    primaryModalButton: {
      backgroundColor: '#007AFF',
    },
    secondaryModalButton: {
      backgroundColor: theme === 'light' ? '#f0f0f0' : '#333',
      borderWidth: 1,
      borderColor: theme === 'light' ? '#ccc' : '#555',
    },
    modalButtonText: {
      fontSize: 16,
      fontWeight: '500',
    },
    primaryModalButtonText: {
      color: '#fff',
    },
    secondaryModalButtonText: {
      color: theme === 'light' ? '#000' : '#fff',
    },
  });

  const renderTeamTab = () => (
    <ScrollView showsVerticalScrollIndicator={false}>
      <TouchableOpacity
        style={dynamicStyles.inviteButton}
        onPress={() => setInviteModalVisible(true)}
      >
        <Ionicons name="person-add" size={20} color="#fff" />
        <Text style={dynamicStyles.inviteButtonText}>Invite Team Member</Text>
      </TouchableOpacity>

      {teamMembers.map((member) => (
        <View key={member.id} style={dynamicStyles.memberItem}>
          <View style={dynamicStyles.memberAvatar}>
            <Text style={dynamicStyles.memberAvatarText}>
              {member.name.split(' ').map(n => n[0]).join('')}
            </Text>
          </View>
          <View style={dynamicStyles.memberInfo}>
            <Text style={dynamicStyles.memberName}>{member.name}</Text>
            <Text style={dynamicStyles.memberEmail}>{member.email}</Text>
            <View style={dynamicStyles.memberStatus}>
              <View
                style={[
                  dynamicStyles.statusDot,
                  { backgroundColor: getStatusColor(member.status) },
                ]}
              />
              <Text style={dynamicStyles.statusText}>
                {member.status === 'offline' && member.lastSeen
                  ? `Last seen ${formatTimeAgo(member.lastSeen)}`
                  : member.status}
              </Text>
            </View>
          </View>
          <View style={dynamicStyles.roleBadge}>
            <Text style={dynamicStyles.roleText}>{member.role.toUpperCase()}</Text>
          </View>
        </View>
      ))}
    </ScrollView>
  );

  const renderActivityTab = () => (
    <ScrollView showsVerticalScrollIndicator={false}>
      {activities.map((activity) => (
        <View key={activity.id} style={dynamicStyles.activityItem}>
          <View style={dynamicStyles.activityIcon}>
            <Ionicons
              name={getActivityIcon(activity.type)}
              size={16}
              color={theme === 'light' ? '#666' : '#aaa'}
            />
          </View>
          <View style={dynamicStyles.activityContent}>
            <Text style={dynamicStyles.activityText}>
              <Text style={dynamicStyles.activityUser}>{activity.user.name}</Text>
              {' '}
              {activity.description}
            </Text>
            <Text style={dynamicStyles.activityTime}>
              {formatTimeAgo(activity.timestamp)}
            </Text>
          </View>
        </View>
      ))}
    </ScrollView>
  );

  const renderResourcesTab = () => (
    <ScrollView showsVerticalScrollIndicator={false}>
      {sharedResources.map((resource) => (
        <View key={resource.id} style={dynamicStyles.resourceItem}>
          <View style={dynamicStyles.resourceIcon}>
            <Ionicons
              name={getResourceIcon(resource.type)}
              size={20}
              color={theme === 'light' ? '#666' : '#aaa'}
            />
          </View>
          <View style={dynamicStyles.resourceInfo}>
            <Text style={dynamicStyles.resourceName}>{resource.name}</Text>
            <Text style={dynamicStyles.resourceMeta}>
              {resource.size} • Shared by {resource.sharedBy.name} • {formatTimeAgo(resource.sharedAt)}
            </Text>
          </View>
          <View style={dynamicStyles.resourceActions}>
            <TouchableOpacity style={dynamicStyles.actionButton}>
              <Ionicons
                name="download"
                size={16}
                color={theme === 'light' ? '#666' : '#aaa'}
              />
            </TouchableOpacity>
            <TouchableOpacity style={dynamicStyles.actionButton}>
              <Ionicons
                name="share"
                size={16}
                color={theme === 'light' ? '#666' : '#aaa'}
              />
            </TouchableOpacity>
          </View>
        </View>
      ))}
    </ScrollView>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'team':
        return renderTeamTab();
      case 'activity':
        return renderActivityTab();
      case 'resources':
        return renderResourcesTab();
      default:
        return null;
    }
  };

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={dynamicStyles.overlay}>
        <View style={dynamicStyles.container}>
          <View style={dynamicStyles.header}>
            <Text style={dynamicStyles.title}>Team Workspace</Text>
            <TouchableOpacity style={dynamicStyles.closeButton} onPress={onClose}>
              <Ionicons
                name="close"
                size={20}
                color={theme === 'light' ? '#666' : '#aaa'}
              />
            </TouchableOpacity>
          </View>

          <View style={dynamicStyles.tabContainer}>
            {tabs.map((tab) => (
              <TouchableOpacity
                key={tab.id}
                style={[
                  dynamicStyles.tab,
                  activeTab === tab.id && dynamicStyles.activeTab,
                ]}
                onPress={() => setActiveTab(tab.id as any)}
              >
                <Ionicons
                  name={tab.icon}
                  size={20}
                  color={activeTab === tab.id ? '#007AFF' : (theme === 'light' ? '#666' : '#aaa')}
                  style={dynamicStyles.tabIcon}
                />
                <Text
                  style={[
                    dynamicStyles.tabText,
                    activeTab === tab.id && dynamicStyles.activeTabText,
                  ]}
                >
                  {tab.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={dynamicStyles.content}>
            {renderTabContent()}
          </View>
        </View>
      </View>

      {/* Invite Member Modal */}
      <Modal visible={inviteModalVisible} transparent animationType="fade">
        <View style={dynamicStyles.inviteModalOverlay}>
          <View style={dynamicStyles.inviteModalContainer}>
            <Text style={dynamicStyles.inviteModalTitle}>Invite Team Member</Text>
            
            <View style={dynamicStyles.inputGroup}>
              <Text style={dynamicStyles.label}>Email Address</Text>
              <TextInput
                style={dynamicStyles.input}
                value={inviteEmail}
                onChangeText={setInviteEmail}
                placeholder="team.member@company.com"
                placeholderTextColor={theme === 'light' ? '#999' : '#666'}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            <View style={dynamicStyles.inputGroup}>
              <Text style={dynamicStyles.label}>Role</Text>
              <View style={dynamicStyles.roleContainer}>
                <TouchableOpacity
                  style={[
                    dynamicStyles.roleButton,
                    inviteRole === 'member' && dynamicStyles.selectedRole,
                  ]}
                  onPress={() => setInviteRole('member')}
                >
                  <Text
                    style={[
                      dynamicStyles.roleButtonText,
                      inviteRole === 'member' && dynamicStyles.selectedRoleText,
                    ]}
                  >
                    Member
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    dynamicStyles.roleButton,
                    inviteRole === 'admin' && dynamicStyles.selectedRole,
                  ]}
                  onPress={() => setInviteRole('admin')}
                >
                  <Text
                    style={[
                      dynamicStyles.roleButtonText,
                      inviteRole === 'admin' && dynamicStyles.selectedRoleText,
                    ]}
                  >
                    Admin
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={dynamicStyles.modalButtonContainer}>
              <TouchableOpacity
                style={[dynamicStyles.modalButton, dynamicStyles.secondaryModalButton]}
                onPress={() => setInviteModalVisible(false)}
              >
                <Text style={[dynamicStyles.modalButtonText, dynamicStyles.secondaryModalButtonText]}>
                  Cancel
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[dynamicStyles.modalButton, dynamicStyles.primaryModalButton]}
                onPress={handleInviteMember}
              >
                <Text style={[dynamicStyles.modalButtonText, dynamicStyles.primaryModalButtonText]}>
                  Send Invite
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </Modal>
  );
};

export default CollaborationWorkspace;
