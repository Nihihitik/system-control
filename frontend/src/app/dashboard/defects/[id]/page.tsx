"use client";

import { useAuth } from "@/lib/auth-context";
import { useRouter, useParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { Header } from "@/components/header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { defectsApi } from "@/lib/api/defects";
import { attachmentsApi } from "@/lib/api/attachments";
import { usersApi } from "@/lib/api/users";
import type { Attachment, Defect, DefectPriority, DefectStatus, User } from "@/types";
import { AttachmentUploader } from "@/components/attachments/attachment-uploader";
import { DefectStatusBadge } from "@/components/defects/defect-status-badge";
import { DefectPriorityBadge } from "@/components/defects/defect-priority-badge";
import { getStatusLabel, getPriorityLabel } from "@/lib/translations";

export default function DefectDetailsPage() {
  const { user, loading } = useAuth();
  const params = useParams();
  const router = useRouter();
  const id = Number(params?.id);

  const [defect, setDefect] = useState<Defect | null>(null);
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [loadingDefect, setLoadingDefect] = useState(true);
  const [saving, setSaving] = useState(false);
  const [statusComment, setStatusComment] = useState("");
  const [assignEmail, setAssignEmail] = useState("");
  const [additionalAssigneeEmail, setAdditionalAssigneeEmail] = useState("");
  const [form, setForm] = useState<{ title: string; description: string; priority: DefectPriority; plannedDate?: string }>({ title: "", description: "", priority: "medium" });

  const canEdit = useMemo(() => {
    if (!user || !defect) return false;
    return user.role === "manager" || user.id === defect.authorId || user.id === (defect.assigneeId || -1);
  }, [user, defect]);

  const isManager = user?.role === "manager";
  const isObserver = user?.role === "observer";

  useEffect(() => {
    if (!loading && !user) router.push("/login");
  }, [user, loading, router]);

  useEffect(() => {
    if (!id || isNaN(id)) return;
    loadAll();
  }, [id]);

  const loadAll = async () => {
    try {
      setLoadingDefect(true);
      const d = await defectsApi.getDefectById(id);
      setDefect(d);
      setForm({
        title: d.title,
        description: d.description,
        priority: d.priority,
        plannedDate: d.plannedDate ? d.plannedDate.substring(0, 10) : undefined,
      });
      const att = await attachmentsApi.getAttachmentsByDefectId(id);
      setAttachments(att);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingDefect(false);
    }
  };

  const allStatuses: DefectStatus[] = ["new", "in_progress", "under_review", "closed", "cancelled"];

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!defect) return;
    try {
      setSaving(true);
      const updated = await defectsApi.updateDefect(defect.id, {
        title: form.title,
        description: form.description,
        priority: form.priority,
        plannedDate: form.plannedDate || undefined,
      });
      setDefect(updated);
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  const handleStatusChange = async (newStatus: DefectStatus) => {
    if (!defect) return;
    try {
      setSaving(true);
      const updated = await defectsApi.updateDefectStatus(defect.id, { status: newStatus, comment: statusComment || undefined });
      setDefect(updated);
      setStatusComment("");
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  const handleAssign = async () => {
    if (!defect || !assignEmail.trim()) return;
    try {
      setSaving(true);
      const engineer: Pick<User, "id" | "firstName" | "lastName" | "middleName" | "email" | "role"> = await usersApi.findByEmail(assignEmail, "engineer");
      const updated = await defectsApi.assignDefect(defect.id, engineer.id);
      setDefect(updated);
      setAssignEmail("");
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  const handleAddAdditionalAssignee = async () => {
    if (!defect || !additionalAssigneeEmail.trim()) return;
    try {
      setSaving(true);
      const engineer: Pick<User, "id" | "firstName" | "lastName" | "middleName" | "email" | "role"> = await usersApi.findByEmail(additionalAssigneeEmail, "engineer");
      await defectsApi.addAdditionalAssignees(defect.id, [engineer.id]);
      setAdditionalAssigneeEmail("");
      await loadAll();
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteAttachment = async (attachmentId: number) => {
    try {
      await attachmentsApi.deleteAttachment(attachmentId);
      setAttachments(prev => prev.filter(a => a.id !== attachmentId));
    } catch (e) {
      console.error(e);
    }
  };

  const canUpload = !!user && !isObserver; // engineers and managers
  const canDeleteAttachment = (a: Attachment) => {
    if (!user || !defect) return false;
    if (user.role === "manager") return true;
    return user.id === defect.authorId || user.id === (defect.assigneeId || -1);
  };

  if (loading || loadingDefect) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p>Загрузка...</p>
      </div>
    );
  }

  if (!defect) return null;

  const currentStatus = defect.status as DefectStatus;

  return (
    <div className="min-h-screen">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="mb-6 flex items-center gap-3">
          <Button variant="outline" onClick={() => router.back()}>← Назад</Button>
          <h1 className="text-2xl font-semibold">Дефект #{defect.id}</h1>
          {isObserver && (
            <Badge variant="secondary">Только просмотр</Badge>
          )}
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          <div className="md:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Общая информация</CardTitle>
                <CardDescription>
                  {defect.project?.name} / {defect.buildingObject?.name} / {defect.stage?.name}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {canEdit ? (
                  <form onSubmit={handleSave} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="title">Заголовок</Label>
                      <Input id="title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="description">Описание</Label>
                      <Textarea id="description" rows={6} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Приоритет</Label>
                        <Select value={form.priority} onValueChange={(v) => setForm({ ...form, priority: v as DefectPriority })}>
                          <SelectTrigger>
                            <SelectValue>{getPriorityLabel(form.priority)}</SelectValue>
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="low">Низкий</SelectItem>
                            <SelectItem value="medium">Средний</SelectItem>
                            <SelectItem value="high">Высокий</SelectItem>
                            <SelectItem value="critical">Критический</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="planned">Плановая дата</Label>
                        <Input id="planned" type="date" value={form.plannedDate || ""} onChange={(e) => setForm({ ...form, plannedDate: e.target.value })} />
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <Button type="submit" disabled={saving}>{saving ? "Сохранение..." : "Сохранить"}</Button>
                    </div>
                  </form>
                ) : (
                  <div className="space-y-3">
                    <div>
                      <h3 className="text-lg font-semibold mb-2">{defect.title}</h3>
                      <p className="text-sm text-muted-foreground whitespace-pre-wrap">{defect.description}</p>
                    </div>
                    <div className="flex gap-4 pt-2 flex-wrap">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">Статус:</span>
                        <DefectStatusBadge status={defect.status} />
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">Приоритет:</span>
                        <DefectPriorityBadge priority={defect.priority} />
                      </div>
                    </div>
                    {defect.plannedDate && (
                      <div className="text-sm text-muted-foreground">
                        <span className="font-medium">Плановая дата:</span> {new Date(defect.plannedDate).toLocaleDateString("ru-RU")}
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Вложения</CardTitle>
                <CardDescription>Фотографии и файлы, прикрепленные к дефекту</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {canUpload && (
                  <div className="border-2 border-dashed rounded-lg p-4 bg-muted/30">
                    <AttachmentUploader defectId={defect.id} onUploaded={async () => setAttachments(await attachmentsApi.getAttachmentsByDefectId(defect.id))} />
                  </div>
                )}
                {attachments.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-8">Нет прикрепленных фотографий</p>
                ) : (
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                    {attachments.map((a) => (
                      <div key={a.id} className="group relative border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                        <a href={attachmentsApi.getDownloadUrl(a.id)} target="_blank" rel="noreferrer" className="block">
                          <img src={attachmentsApi.getDownloadUrl(a.id)} alt={a.fileName} className="w-full h-40 object-cover" />
                        </a>
                        <div className="p-2 bg-background">
                          <p className="text-xs truncate" title={a.fileName}>{a.fileName}</p>
                          {canDeleteAttachment(a) && (
                            <Button 
                              size="sm" 
                              variant="ghost" 
                              className="w-full mt-1 h-7 text-xs text-red-600 hover:text-red-700 hover:bg-red-50" 
                              onClick={() => handleDeleteAttachment(a.id)}
                            >
                              Удалить
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Информация</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3 text-sm">
                  <div>
                    <p className="text-muted-foreground mb-1">Автор</p>
                    <p className="font-medium">{defect.author?.lastName} {defect.author?.firstName}</p>
                    <p className="text-xs text-muted-foreground">{defect.author?.email}</p>
                  </div>
                  {defect.assignee && (
                    <div>
                      <p className="text-muted-foreground mb-1">Исполнитель</p>
                      <p className="font-medium">{defect.assignee.lastName} {defect.assignee.firstName}</p>
                      <p className="text-xs text-muted-foreground">{defect.assignee.email}</p>
                    </div>
                  )}
                  {defect.additionalAssignees && defect.additionalAssignees.length > 0 && (
                    <div>
                      <p className="text-muted-foreground mb-1">Доп. исполнители</p>
                      <div className="space-y-1">
                        {defect.additionalAssignees.map((aa: any) => (
                          <div key={aa.id} className="text-xs">
                            <p className="font-medium">{aa.user.lastName} {aa.user.firstName}</p>
                            <p className="text-muted-foreground">{aa.user.email}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  <div>
                    <p className="text-muted-foreground mb-1">Создан</p>
                    <p className="font-medium">{new Date(defect.createdAt).toLocaleString('ru-RU')}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground mb-1">Обновлен</p>
                    <p className="font-medium">{new Date(defect.updatedAt).toLocaleString('ru-RU')}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Статус</CardTitle>
                <CardDescription>Изменение статуса дефекта</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Текущий статус</Label>
                  <div><DefectStatusBadge status={defect.status} /></div>
                </div>
                {!isObserver && (
                  <>
                    <div className="space-y-2">
                      <Label>Изменить статус</Label>
                      <Select
                        onValueChange={(v) => handleStatusChange(v as DefectStatus)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Выберите новый статус" />
                        </SelectTrigger>
                        <SelectContent>
                          {allStatuses.filter(s => s !== currentStatus).map((s) => (
                            <SelectItem key={s} value={s}>{getStatusLabel(s)}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="statusComment">Комментарий к изменению</Label>
                      <Textarea id="statusComment" rows={3} value={statusComment} onChange={(e) => setStatusComment(e.target.value)} placeholder="Необязательно" />
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            {isManager && (
              <Card>
                <CardHeader>
                  <CardTitle>Назначения</CardTitle>
                  <CardDescription>Управление исполнителями</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="assign" className="text-sm font-semibold">Основной исполнитель</Label>
                    <div className="flex flex-col gap-2">
                      <Input id="assign" type="email" placeholder="engineer@example.com" value={assignEmail} onChange={(e) => setAssignEmail(e.target.value)} />
                      <Button onClick={handleAssign} disabled={!assignEmail.trim() || saving} size="sm" className="w-full">
                        {saving ? "Назначение..." : "Назначить"}
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground">Введите email инженера</p>
                  </div>
                  
                  <div className="border-t pt-4 space-y-2">
                    <Label htmlFor="additional" className="text-sm font-semibold">Дополнительные исполнители</Label>
                    <div className="flex flex-col gap-2">
                      <Input id="additional" type="email" placeholder="engineer@example.com" value={additionalAssigneeEmail} onChange={(e) => setAdditionalAssigneeEmail(e.target.value)} />
                      <Button onClick={handleAddAdditionalAssignee} disabled={!additionalAssigneeEmail.trim() || saving} size="sm" variant="outline" className="w-full">
                        {saving ? "Добавление..." : "Добавить"}
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground">Можно добавить несколько</p>
                  </div>
                </CardContent>
              </Card>
            )}
            {canEdit && !isManager && (
              <Card>
                <CardHeader>
                  <CardTitle>Доп. исполнители</CardTitle>
                  <CardDescription>Добавить инженеров на задачу</CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Label htmlFor="eng-additional" className="text-sm font-semibold">Добавить инженера</Label>
                  <div className="flex flex-col gap-2">
                    <Input id="eng-additional" type="email" placeholder="engineer@example.com" value={additionalAssigneeEmail} onChange={(e) => setAdditionalAssigneeEmail(e.target.value)} />
                    <Button onClick={handleAddAdditionalAssignee} disabled={!additionalAssigneeEmail.trim() || saving} size="sm" variant="outline" className="w-full">
                      {saving ? "Добавление..." : "Добавить"}
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">Введите email инженера</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
