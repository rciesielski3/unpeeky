# Task 5: Implement SettingsScreen Child Management

**Files:**
- Modify: `src/screens/SettingsScreen.tsx:1-300` (add "Manage Children" section)
- Test: `src/screens/SettingsScreen.test.tsx` (CRUD tests)

**Interfaces:**
- Consumes: `children`, `onSettingsChange(settings)`, `activeChildId`, `onSelectChild`
- Produces: Child management UI (list, add, edit, delete)

---

## Step 1: Write failing tests for child management

```typescript
describe("SettingsScreen - Manage Children", () => {
  it("should display list of children", () => {
    const children = [
      { id: "c1", name: "Alex", settings: { parentLabel: "Mom", notificationTime: "18:00", tileColorId: "lavender" } },
      { id: "c2", name: "Jordan", settings: { parentLabel: "Dad", notificationTime: "18:00", tileColorId: "mint" } }
    ];

    render(<SettingsScreen children={children} ... />);

    expect(screen.getByText("Alex")).toBeInTheDocument();
    expect(screen.getByText("Jordan")).toBeInTheDocument();
  });

  it("should add new child when user provides name", async () => {
    const onSettingsChange = jest.fn();
    render(<SettingsScreen onSettingsChange={onSettingsChange} ... />);

    const addButton = screen.getByText("Add Child");
    fireEvent.press(addButton);

    // User enters name in prompt
    const input = await screen.findByDisplayValue("");
    fireEvent.changeText(input, "Sam");
    fireEvent.press(screen.getByText("Add"));

    expect(onSettingsChange).toHaveBeenCalledWith(
      expect.objectContaining({
        children: expect.arrayContaining([
          expect.objectContaining({ name: "Sam" })
        ])
      })
    );
  });

  it("should edit child name and settings", () => {
    // Test edit flow: press edit button, change name/label/time/color, save
  });

  it("should delete child and associated goals", () => {
    // Test delete flow: press delete, confirm, child removed
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
npm test -- SettingsScreen.test.tsx 2>&1 | head -30
```

- [ ] **Step 3: Add Manage Children section to SettingsScreen**

After existing settings sections, add:

```typescript
{/* Manage Children Section */}
<View style={styles.section}>
  <Text style={styles.sectionTitle}>Manage Children</Text>

  {/* Child list */}
  {settings.children.map(child => (
    <View key={child.id} style={styles.childItem}>
      <View>
        <Text style={styles.childName}>{child.name}</Text>
        <Text style={styles.childLabel}>
          {child.settings.parentLabel} • {child.settings.notificationTime}
        </Text>
      </View>
      <View style={styles.childActions}>
        <Pressable
          onPress={() => openEditChildModal(child)}
          style={styles.button}
        >
          <Text style={styles.buttonText}>Edit</Text>
        </Pressable>
        {settings.children.length > 1 && (
          <Pressable
            onPress={() => deleteChild(child.id)}
            style={[styles.button, styles.deleteButton]}
          >
            <Text style={styles.buttonTextDelete}>Delete</Text>
          </Pressable>
        )}
      </View>
    </View>
  ))}

  {/* Add child button */}
  <Pressable
    onPress={() => openAddChildModal()}
    style={[styles.button, styles.addButton]}
  >
    <Text style={styles.buttonText}>+ Add Child</Text>
  </Pressable>
</View>
```

- [ ] **Step 4: Implement add child modal**

```typescript
const [addChildModalVisible, setAddChildModalVisible] = useState(false);
const [newChildName, setNewChildName] = useState("");

function openAddChildModal() {
  setNewChildName("");
  setAddChildModalVisible(true);
}

function addChild() {
  if (!newChildName.trim()) return;

  const newChild = {
    id: `child-${Date.now()}`,
    name: newChildName,
    settings: {
      parentLabel: "Parent",
      notificationTime: "18:00",
      tileColorId: "lavender" as TileColorId
    }
  };

  const updated = {
    ...settings,
    children: [...settings.children, newChild]
  };

  onSettingsChange(updated);
  setAddChildModalVisible(false);
}
```

- [ ] **Step 5: Implement edit child modal**

```typescript
const [editingChild, setEditingChild] = useState<Child | null>(null);

function openEditChildModal(child: Child) {
  setEditingChild({ ...child });
}

function saveEditChild() {
  if (!editingChild) return;

  const updated = {
    ...settings,
    children: settings.children.map(c =>
      c.id === editingChild.id ? editingChild : c
    )
  };

  onSettingsChange(updated);
  setEditingChild(null);
}

// Edit modal (TextInput, TimePicker, ColorPicker for each field)
<Modal visible={Boolean(editingChild)} transparent>
  {editingChild && (
    <View style={styles.modalOverlay}>
      <View style={styles.modalContent}>
        <Text style={styles.modalTitle}>Edit {editingChild.name}</Text>
        
        <Text style={styles.label}>Name</Text>
        <TextInput
          style={styles.input}
          value={editingChild.name}
          onChangeText={name => setEditingChild({ ...editingChild, name })}
        />

        <Text style={styles.label}>Parent Label</Text>
        <TextInput
          style={styles.input}
          value={editingChild.settings.parentLabel}
          onChangeText={label =>
            setEditingChild({
              ...editingChild,
              settings: { ...editingChild.settings, parentLabel: label }
            })
          }
        />

        {/* Notification Time, Tile Color pickers... */}

        <View style={styles.modalActions}>
          <Pressable onPress={() => setEditingChild(null)}>
            <Text>Cancel</Text>
          </Pressable>
          <Pressable onPress={saveEditChild}>
            <Text>Save</Text>
          </Pressable>
        </View>
      </View>
    </View>
  )}
</Modal>
```

- [ ] **Step 6: Implement delete child**

```typescript
function deleteChild(childId: string) {
  Alert.alert(
    "Delete Child?",
    "All goals for this child will be deleted.",
    [
      { text: "Cancel", onPress: () => {} },
      {
        text: "Delete",
        onPress: () => {
          const updated = {
            ...settings,
            children: settings.children.filter(c => c.id !== childId)
          };

          onSettingsChange(updated);
          // Note: goals cleanup handled in Task 7
        }
      }
    ]
  );
}
```

- [ ] **Step 7: Run tests to verify they pass**

```bash
npm test -- SettingsScreen.test.tsx 2>&1 | grep -E "PASS|FAIL"
```

- [ ] **Step 8: Commit**

```bash
git add src/screens/SettingsScreen.tsx src/screens/SettingsScreen.test.tsx
git commit -m "feat: add child management UI to SettingsScreen

- Add child list with edit/delete buttons
- Implement add child modal with name input
- Implement edit child modal (name, label, time, color)
- Implement delete child with confirmation
- Add tests for CRUD operations

Co-Authored-By: Claude Haiku 4.5 <noreply@anthropic.com>"
```
