import { MessageSquare, LayoutDashboard, PanelLeftClose } from "lucide-react";
import { Link } from "react-router-dom";
function GlobalSidebar() {
	return (
		<div className="drawer absolute h-[calc(100dvh-5rem)]">
			<input id="my-drawer-2" type="checkbox" className="drawer-toggle" />
			{/* <div className="drawer-content flex flex-col items-start justify-center">
				<></>
				<label
					htmlFor="my-drawer-2"
					className="fixed z-50 top-5 left-7 fill-white drawer-button"
				>
					<PanelLeftClose />
				</label>
			</div> */}

			<div className="drawer-side top-14 left-0 z-10 h-[calc(100dvh-5rem)]">
				<label
					htmlFor="my-drawer-2"
					aria-label="close sidebar"
					className="drawer-overlay"
				></label>
				<ul className="menu bg-base-200 text-base-content h-[calc(100dvh-5rem)] w-80 p-4">
					{/* Sidebar content here */}
					<li className="my-6">
						<Link className="text-base" to="#">
							<LayoutDashboard className="w-5 h-5" />
							Dashboard
						</Link>
					</li>
					<li className="mb-3">
						<Link className="text-base" to="/conversations">
							<MessageSquare className="w-5 h-5" />
							Conversations
						</Link>
					</li>
				</ul>
			</div>
		</div>
	);
}

export default GlobalSidebar;
