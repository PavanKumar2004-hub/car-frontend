import { useEffect, useState } from "react";
import { useDashboardStore, type Member } from "../store/dashboard.store";

type Props = {
  open: boolean;
  onClose: () => void;
};

type EditableMember = Member & { isEditing?: boolean };

export function MembersListModal({ open, onClose }: Props) {
  const { members, fetchMembers, addMember, updateMember, deleteMember } =
    useDashboardStore();
  const loadUser = useDashboardStore((s) => s.loadUser);
  const loadContextRole = useDashboardStore((s) => s.loadContextRole);

  const { contextRole } = useDashboardStore();

  const [list, setList] = useState<EditableMember[]>([]);
  const [newMember, setNewMember] = useState({
    phone: "",
    relation: "",
    role: "FAMILY" as "FAMILY" | "FRIEND",
  });

  /* -------------------------------
     Load Members
  -------------------------------- */
  useEffect(() => {
    if (open) fetchMembers();
    // 2. Load authenticated user
    try {
      loadUser();
      loadContextRole();
    } catch (err) {
      console.log(err);
    }

    // 3. Resolve dashboard role (OWNER / FAMILY / FRIEND)
  }, [open]);

  useEffect(() => {
    setList(members.map((m) => ({ ...m, isEditing: false })));
  }, [members]);

  if (!open) return null;

  /* -------------------------------
     Handlers
  -------------------------------- */
  const toggleEdit = (id: string) => {
    setList((prev) =>
      prev.map((m) => (m._id === id ? { ...m, isEditing: !m.isEditing } : m))
    );
  };

  const updateField = (
    id: string,
    field: "relation" | "role",
    value: string
  ) => {
    setList((prev) =>
      prev.map((m) => (m._id === id ? { ...m, [field]: value } : m))
    );
  };

  const saveUpdate = async (m: EditableMember) => {
    await updateMember(m._id, {
      relation: m.relation,
      role: m.role,
    });
    toggleEdit(m._id);
  };

  const removeMember = async (id: string) => {
    if (!window.confirm("Delete member? Approval may be required.")) return;
    await deleteMember(id);
  };

  const addNewMember = async () => {
    if (!newMember.phone || !newMember.relation) return;

    await addMember({
      phone: newMember.phone,
      relation: newMember.relation,
      role: newMember.role,
    });

    setNewMember({ phone: "", relation: "", role: "FAMILY" });
  };

  /* -------------------------------
     UI
  -------------------------------- */
  return (
    <div className='fixed inset-0 z-1000 bg-black/80 flex items-center justify-center'>
      <div className='w-[700px] max-h-[80vh] overflow-hidden rounded-xl bg-[#0b0f14] border-2 border-cyan-500/70 shadow-2xl'>
        {/* Header */}
        <div className='flex items-center justify-between px-6! py-4! border-b border-gray-800'>
          <h2 className='text-lg font-semibold text-white'>Members</h2>
          <button onClick={onClose} className='text-gray-400'>
            ✕
          </button>
        </div>

        {/* Body */}
        <div className='p-6! space-y-4 overflow-y-auto max-h-[60vh]'>
          {/* Existing Members */}
          {list.map((m) => (
            <div
              key={m._id}
              className='grid grid-cols-5 gap-3 items-center bg-black/40 p-3! rounded-lg border border-gray-800'
            >
              {/* Name (read-only) */}
              <div className='text-white text-sm'>{m.userId.name}</div>

              {/* Phone (read-only) */}
              <div className='text-gray-400 text-sm'>{m.userId.phone}</div>

              {/* Relation */}
              <input
                value={m.relation}
                disabled={!m.isEditing}
                onChange={(e) => updateField(m._id, "relation", e.target.value)}
                className='bg-transparent border border-gray-700 px-2! py-1! rounded text-white'
              />

              {/* Role */}
              <select
                value={m.role}
                disabled={!m.isEditing}
                onChange={(e) => updateField(m._id, "role", e.target.value)}
                className='bg-black border border-gray-700 px-2! py-1! rounded text-white'
              >
                <option value='FAMILY'>Family</option>
                <option value='FRIEND'>Friend</option>
              </select>

              {/* Actions */}
              <div className='flex gap-2 justify-end'>
                {m.isEditing ? (
                  <>
                    <button
                      onClick={() => saveUpdate(m)}
                      disabled={!contextRole}
                      className='text-cyan-400 disabled:opacity-40'
                    >
                      Save
                    </button>
                    <button
                      onClick={() => toggleEdit(m._id)}
                      className='text-gray-400'
                    >
                      Cancel
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => toggleEdit(m._id)}
                      className='text-yellow-400'
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => removeMember(m._id)}
                      className='text-red-400'
                    >
                      Delete
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}

          {/* Add New Member */}
          {contextRole === "OWNER" && (
            <div className='grid grid-cols-5 gap-3 items-center border-t border-gray-800 pt-4!'>
              <input
                placeholder='Phone'
                value={newMember.phone}
                onChange={(e) =>
                  setNewMember({ ...newMember, phone: e.target.value })
                }
                className='bg-black/40 border border-gray-700 px-2! py-1! rounded text-white'
              />

              <input
                placeholder='Relation'
                value={newMember.relation}
                onChange={(e) =>
                  setNewMember({ ...newMember, relation: e.target.value })
                }
                className='bg-black/40 border border-gray-700 px-2! py-1! rounded text-white'
              />

              <select
                value={newMember.role}
                onChange={(e) =>
                  setNewMember({
                    ...newMember,
                    role: e.target.value as "FAMILY" | "FRIEND",
                  })
                }
                className='bg-black border border-gray-700 px-2! py-1! rounded text-white'
              >
                <option value='FAMILY'>Family</option>
                <option value='FRIEND'>Friend</option>
              </select>

              <div />

              <button
                onClick={addNewMember}
                className='bg-cyan-500 text-black rounded px-3! py-1! font-medium'
              >
                Add
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
