import * as roles from './roleTypes'

export default {
  [roles.MANAGEMENT_USER]: {
    queries: { 
      canRespond: true,
      canReject: true,
      canReassign: true,
      canSendEmail: true,
      canEscalate: true
    }
  },
  [roles.DELIVERY_USER]: {
    queries: { 
      canRespond: true,
      canReject: true,
      canReassign: true,
      canMassEdit: true
    }
  },
  [roles.CONTRACT_ADMIN_USER]: {
    queries: { 
      canMassEdit: true
    }
  }
}