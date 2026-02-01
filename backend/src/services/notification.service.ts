import prisma from '../config/database'
import { ApiResponse } from '../types'

export const getAgencyNotifications = async (agencyId: string): Promise<ApiResponse> => {
  const notifications = await prisma.notification.findMany({
    where: { agencyId },
    include: {
      booking: {
        include: {
          package: {
            select: {
              id: true,
              title: true,
            },
          },
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  })

  return {
    success: true,
    data: notifications,
  }
}

export const getUnreadNotifications = async (agencyId: string): Promise<ApiResponse> => {
  const notifications = await prisma.notification.findMany({
    where: {
      agencyId,
      isRead: false,
    },
    orderBy: {
      createdAt: 'desc',
    },
  })

  return {
    success: true,
    data: notifications,
  }
}

export const markNotificationAsRead = async (id: string, agencyId: string): Promise<ApiResponse> => {
  const notification = await prisma.notification.findFirst({
    where: { id, agencyId },
  })

  if (!notification) {
    return {
      success: false,
      error: {
        code: 'NOT_FOUND',
        message: 'Notification not found',
      },
    }
  }

  const updated = await prisma.notification.update({
    where: { id },
    data: {
      isRead: true,
      readAt: new Date(),
    },
  })

  return {
    success: true,
    data: updated,
  }
}

export const markAllNotificationsAsRead = async (agencyId: string): Promise<ApiResponse> => {
  await prisma.notification.updateMany({
    where: {
      agencyId,
      isRead: false,
    },
    data: {
      isRead: true,
      readAt: new Date(),
    },
  })

  return {
    success: true,
    message: 'All notifications marked as read',
  }
}

export const deleteNotification = async (id: string, agencyId: string): Promise<ApiResponse> => {
  const notification = await prisma.notification.findFirst({
    where: { id, agencyId },
  })

  if (!notification) {
    return {
      success: false,
      error: {
        code: 'NOT_FOUND',
        message: 'Notification not found',
      },
    }
  }

  await prisma.notification.delete({
    where: { id },
  })

  return {
    success: true,
    message: 'Notification deleted successfully',
  }
}

export const getUnreadCount = async (agencyId: string): Promise<ApiResponse> => {
  const count = await prisma.notification.count({
    where: {
      agencyId,
      isRead: false,
    },
  })

  return {
    success: true,
    data: { count },
  }
}
